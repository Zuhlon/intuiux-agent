import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, correction } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const ideaStage = await db.pipelineStage.findUnique({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 1 } }
    });
    const cjmStage = await db.pipelineStage.findUnique({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 3 } }
    });
    const iaStage = await db.pipelineStage.findUnique({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 4 } }
    });

    if (!ideaStage?.outputData || !cjmStage?.outputData || !iaStage?.outputData) {
      return NextResponse.json({ success: false, error: 'Previous stages not completed' }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const cjmData = JSON.parse(cjmStage.outputData);
    const iaData = JSON.parse(iaStage.outputData);

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 5 } },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, cjmData, iaData, correction })
      }
    });

    const systemPrompt = `Ты — senior UX designer. Создай детальные пользовательские сценарии (userflows).

Ответь в формате JSON:
{
  "scenarios": [
    {
      "name": "Название сценария",
      "description": "Описание сценария",
      "actor": "Пользовательская роль",
      "preconditions": ["Предусловие 1", "Предусловие 2"],
      "steps": [
        {
          "stepNumber": 1,
          "action": "Действие пользователя",
          "system": "Ответ системы",
          "uiElements": ["Элемент UI 1", "Элемент UI 2"],
          "expectedResult": "Ожидаемый результат",
          "alternativePath": "Альтернативный путь (если есть)",
          "errorHandling": "Обработка ошибок"
        }
      ],
      "postconditions": ["Постусловие 1"],
      "happyPath": true,
      "edgeCases": ["Краевой случай 1", "Краевой случай 2"]
    }
  ],
  "userRoles": [
    {
      "name": "Название роли",
      "description": "Описание",
      "permissions": ["Разрешение 1", "Разрешение 2"]
    }
  ],
  "interactions": [
    {
      "from": "Экран А",
      "to": "Экран Б",
      "trigger": "Действие",
      "type": "navigation/modal/etc"
    }
  ],
  "summary": "Общее описание пользовательских потоков"
}

Важно: отвечай ТОЛЬКО валидным JSON. Создай минимум 3 основных сценария.`;

    const userPrompt = correction
      ? `Идея:\n${JSON.stringify(ideaData, null, 2)}\n\nCJM:\n${JSON.stringify(cjmData, null, 2)}\n\nIA:\n${JSON.stringify(iaData, null, 2)}\n\nКорректировка:\n${correction}`
      : `Создай пользовательские сценарии на основе:\n\nИдея:\n${JSON.stringify(ideaData, null, 2)}\n\nCJM:\n${JSON.stringify(cjmData, null, 2)}\n\nIA:\n${JSON.stringify(iaData, null, 2)}`;

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let userflowData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        userflowData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      userflowData = {
        scenarios: [],
        userRoles: [],
        interactions: [],
        summary: ''
      };
    }

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 5 } },
      data: {
        status: 'completed',
        outputData: JSON.stringify(userflowData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: userflowData });

  } catch (error) {
    console.error('Userflow generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      await db.pipelineStage.update({
        where: { sessionId_stageNumber: { sessionId: body.sessionId, stageNumber: 5 } },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(console.error);
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create userflow' 
    }, { status: 500 });
  }
}
