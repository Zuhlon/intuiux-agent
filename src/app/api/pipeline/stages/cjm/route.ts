import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, correction } = body;

    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing sessionId' 
      }, { status: 400 });
    }

    const ideaStage = await db.pipelineStage.findUnique({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 1 } }
    });
    const competitorsStage = await db.pipelineStage.findUnique({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 2 } }
    });

    if (!ideaStage?.outputData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Previous stages not completed' 
      }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const competitorsData = competitorsStage?.outputData ? JSON.parse(competitorsStage.outputData) : null;

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 3 } },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, competitorsData, correction })
      }
    });

    const systemPrompt = `Ты — senior UX researcher. Твоя задача — создать детальную Customer Journey Map.

Создай CJM с 5-7 этапами пути клиента. Для каждого этапа опиши:
- Touchpoints (точки контакта)
- User actions (действия пользователя)
- Emotions (эмоции: positive/negative/neutral)
- Pain points (боли)
- Opportunities (возможности для улучшения)

Ответь в формате JSON:
{
  "persona": {
    "name": "Имя персоны",
    "demographics": "Демография",
    "goals": ["Цель 1", "Цель 2"],
    "frustrations": ["Фрустрация 1", "Фрустрация 2"],
    "motivations": ["Мотивация 1", "Мотивация 2"]
  },
  "journeyStages": [
    {
      "name": "Название этапа",
      "order": 1,
      "description": "Описание этапа",
      "touchpoints": ["Точка контакта 1", "Точка контакта 2"],
      "userActions": ["Действие 1", "Действие 2"],
      "emotions": ["Эмоция 1"],
      "emotionScore": 3,
      "painPoints": ["Боль 1", "Боль 2"],
      "opportunities": ["Возможность 1", "Возможность 2"],
      "channels": ["Канал 1", "Канал 2"]
    }
  ],
  "keyInsights": ["Инсайт 1", "Инсайт 2", "Инсайт 3"],
  "recommendations": ["Рекомендация 1", "Рекомендация 2"]
}

Важно: отвечай ТОЛЬКО валидным JSON. emotionScore от -5 до +5.`;

    const userPrompt = correction
      ? `Идея продукта:\n${JSON.stringify(ideaData, null, 2)}\n\nДанные конкурентов:\n${JSON.stringify(competitorsData, null, 2)}\n\nКорректировка:\n${correction}`
      : `Создай Customer Journey Map для идеи продукта:\n\n${JSON.stringify(ideaData, null, 2)}\n\nС учетом конкурентного анализа:\n${JSON.stringify(competitorsData, null, 2)}`;

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let cjmData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cjmData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      cjmData = {
        persona: { name: 'Пользователь', demographics: '', goals: [], frustrations: [], motivations: [] },
        journeyStages: [],
        keyInsights: [],
        recommendations: []
      };
    }

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 3 } },
      data: {
        status: 'completed',
        outputData: JSON.stringify(cjmData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: cjmData });

  } catch (error) {
    console.error('CJM generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      await db.pipelineStage.update({
        where: { sessionId_stageNumber: { sessionId: body.sessionId, stageNumber: 3 } },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(console.error);
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create CJM' 
    }, { status: 500 });
  }
}
