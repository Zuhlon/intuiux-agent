import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, correction } = body

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const ideaStage = await db.pipelineStage.findUnique({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 1 } }
    });
    const prototypeStage = await db.pipelineStage.findUnique({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 6 } }
    });

    if (!ideaStage?.outputData || !prototypeStage?.outputData) {
      return NextResponse.json({ success: false, error: 'Previous stages not completed' }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const prototypeData = prototypeStage?.outputData ? JSON.parse(prototypeStage.outputData) : null;

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 7 } },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, prototypeData, correction })
      }
    });

    const systemPrompt = `Ты — senior UX researcher. Создай полное руководство по юзабилити-тестированию для продукта.

Ответь в формате JSON:
{
  "overview": {
    "purpose": "Цель тестирования",
    "scope": "Область тестирования",
    "targetUsers": "Целевые пользователи",
    "duration": "Рекомендуемая длительность"
  },
  "preparation": {
    "checklist": ["Пункт 1", "Пункт 2"],
    "equipment": ["Оборудование 1", "Оборудование 2"],
    "environment": "Описание среды тестирования"
  },
  "tasks": [
    {
      "name": "Название задачи",
      "description": "Описание для модератора",
      "scenario": "Сценарий для участника",
      "successCriteria": ["Критерий успеха 1", "Критерий 2"],
      "estimatedTime": "Время",
      "priority": "high/medium/low"
    }
  ],
  "questions": {
    "preTest": ["Вопрос перед тестом 1"],
    "duringTest": ["Вопрос во время теста 1"],
    "postTest": ["Вопрос после теста 1"],
    "satisfactionScale": {
      "name": "SUS/NPS/etc",
      "questions": ["Вопрос 1"]
    }
  },
  "moderatorGuide": {
    "introduction": "Текст введения",
    "instructions": "Инструкции для модератора",
    "thingsToAvoid": ["Избегать 1", "Избегать 2"],
    "thinkAloud": "Инструкция think-aloud"
  },
  "dataCollection": {
    "methods": ["Метод 1", "Метод 2"],
    "metrics": ["Метрика 1", "Метрика 2"],
    "tools": ["Инструмент 1"]
  },
  "analysis": {
    "framework": "Фреймворк анализа",
    "severityScale": {
      "critical": "Описание",
      "major": "Описание",
      "minor": "Описание"
    },
    "reporting": "Формат отчёта"
  }
}

Важно: отвечай ТОЛЬКО валидным JSON. Создай подробное руководство.`;

    const userPrompt = correction
      ? `Идея продукта:\n${JSON.stringify(ideaData, null, 2)}\n\nПрототип:\n${JSON.stringify(prototypeData, null, 2)}\n\nКорректировка:\n${correction}`
      : `Создай руководство по тестированию для:\n\n${JSON.stringify(ideaData, null, 2)}\n\nПрототип:\n${JSON.stringify(prototypeData, null, 2)}`;

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let guidelinesData
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        guidelinesData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found')
      }
    } catch {
      guidelinesData = {
        overview: { purpose: '', scope: '', targetUsers: '', duration: '' },
        preparation: { checklist: [], equipment: [], environment: '' },
        tasks: [],
        questions: { preTest: [], duringTest: [], postTest: [], satisfactionScale: { name: '', questions: [] } },
        moderatorGuide: { introduction: '', instructions: '', thingsToAvoid: [], thinkAloud: '' },
        dataCollection: { methods: [], metrics: [], tools: [] },
        analysis: { framework: '', severityScale: { critical: '', major: '', minor: '' }, reporting: '' }
      }
    }

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 8 } },
      data: {
        status: 'completed',
        outputData: JSON.stringify(guidelinesData),
        completedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, data: guidelinesData })

  } catch (error) {
    console.error('Guidelines generation error:', error)
    
    const body = await request.clone().json().catch(() => ({}))
    if (body.sessionId) {
      await db.pipelineStage.update({
        where: { sessionId_stageNumber: { sessionId: body.sessionId, stageNumber: 8 } },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(console.error)
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create guidelines' 
    }, { status: 500 })
  }
}
