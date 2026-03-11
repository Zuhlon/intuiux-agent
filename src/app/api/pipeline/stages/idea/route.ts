import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, inputText, correction } = body;

    if (!sessionId || !inputText) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing sessionId or inputText' 
      }, { status: 400 });
    }

    await db.pipelineStage.update({
      where: {
        sessionId_stageNumber: { sessionId, stageNumber: 1 }
      },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ inputText, correction })
      }
    });

    const systemPrompt = `Ты — старший UX-исследователь. Твоя задача — извлечь и структурировать идею продукта из предоставленного текста или транскрипции.

Ответь в формате JSON со следующей структурой:
{
  "title": "Название идеи продукта",
  "problem": "Описание проблемы, которую решает продукт",
  "solution": "Описание решения",
  "targetAudience": "Описание целевой аудитории",
  "keyFeatures": ["функция 1", "функция 2", "функция 3"],
  "valueProposition": "Ценностное предложение",
  "summary": "Краткое резюме идеи в 2-3 предложениях",
  "searchKeywords": ["ключевое слово 1", "ключевое слово 2"] 
}

Важно: отвечай ТОЛЬКО валидным JSON без дополнительного текста. В searchKeywords добавь ключевые слова для поиска конкурентов.`;

    const userPrompt = correction 
      ? `Исходный текст:\n${inputText}\n\nКорректировка от пользователя:\n${correction}\n\nУчти корректировку и обнови структуру идеи.`
      : `Проанализируй следующий текст и извлеки идею продукта:\n\n${inputText}`;

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let ideaData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ideaData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', response);
      ideaData = {
        title: 'Идея продукта',
        problem: response.substring(0, 500),
        solution: '',
        targetAudience: '',
        keyFeatures: [],
        valueProposition: '',
        summary: response.substring(0, 300),
        searchKeywords: []
      };
    }

    await db.pipelineStage.update({
      where: {
        sessionId_stageNumber: { sessionId, stageNumber: 1 }
      },
      data: {
        status: 'completed',
        outputData: JSON.stringify(ideaData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: ideaData });

  } catch (error) {
    console.error('Idea generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      await db.pipelineStage.update({
        where: {
          sessionId_stageNumber: { sessionId: body.sessionId, stageNumber: 1 }
        },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(console.error);
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process idea' 
    }, { status: 500 });
  }
}
