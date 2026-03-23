import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';
import { detectProductType, getProductTypeLabel } from '@/lib/pipeline-config';

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

    // Find the idea stage
    const ideaStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'idea' }
    });

    if (!ideaStage) {
      return NextResponse.json({ 
        success: false, 
        error: 'Idea stage not found' 
      }, { status: 400 });
    }

    await db.pipelineStage.update({
      where: { id: ideaStage.id },
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

    // Detect product type from input text
    const productType = detectProductType(inputText + ' ' + (ideaData.title || '') + ' ' + (ideaData.solution || ''));
    
    // Update session with product type if not set
    await db.pipelineSession.update({
      where: { id: sessionId },
      data: { 
        productType: productType,
        name: ideaData.title?.substring(0, 50) || `Проект ${new Date().toLocaleDateString('ru-RU')}`
      }
    });

    await db.pipelineStage.update({
      where: { id: ideaStage.id },
      data: {
        status: 'completed',
        outputData: JSON.stringify(ideaData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: ideaData,
      productType: productType,
      productTypeLabel: getProductTypeLabel(productType)
    });

  } catch (error) {
    console.error('Idea generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      const ideaStage = await db.pipelineStage.findFirst({
        where: { sessionId: body.sessionId, stageName: 'idea' }
      });
      if (ideaStage) {
        await db.pipelineStage.update({
          where: { id: ideaStage.id },
          data: {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process idea' 
    }, { status: 500 });
  }
}
