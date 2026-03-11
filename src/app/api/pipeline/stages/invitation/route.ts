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
    const prototypeStage = await db.pipelineStage.findUnique({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 6 } }
    });

    if (!ideaStage?.outputData || !prototypeStage?.outputData) {
      return NextResponse.json({ success: false, error: 'Previous stages not completed' }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const prototypeData = JSON.parse(prototypeStage.outputData);

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 7 } },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, prototypeData, correction })
      }
    });

    const systemPrompt = `Ты — UX researcher. Создай скрипт приглашения на тестирование продукта.

Ответь в формате JSON:
{
  "invitations": [
    {
      "channel": "email",
      "subject": "Тема письма",
      "body": "Текст письма с плейсхолдерами [ИМЯ], [ССЫЛКА] и т.д.",
      "callToAction": "Текст кнопки/CTA"
    },
    {
      "channel": "telegram",
      "body": "Короткое сообщение для мессенджера"
    },
    {
      "channel": "social",
      "body": "Пост для социальных сетей"
    }
  ],
  "screenerQuestions": [
    {
      "question": "Вопрос для скрининга",
      "type": "single/multiple/text",
      "options": ["Вариант 1", "Вариант 2"],
      "required": true
    }
  ],
  "testingInfo": {
    "duration": "Длительность тестирования",
    "reward": "Вознаграждение",
    "format": "Формат (онлайн/офис)",
    "deadline": "Дедлайн"
  },
  "tips": ["Совет 1 по приглашению", "Совет 2"]
}

Важно: отвечай ТОЛЬКО валидным JSON. Создай приглашения для разных каналов.`;

    const userPrompt = correction
      ? `Идея продукта:\n${JSON.stringify(ideaData, null, 2)}\n\nКорректировка:\n${correction}`
      : `Создай приглашение на тестирование для продукта:\n\n${JSON.stringify(ideaData, null, 2)}`;

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let invitationData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        invitationData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      invitationData = {
        invitations: [],
        screenerQuestions: [],
        testingInfo: { duration: '30 минут', reward: '', format: 'онлайн', deadline: '' },
        tips: []
      };
    }

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 7 } },
      data: {
        status: 'completed',
        outputData: JSON.stringify(invitationData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: invitationData });

  } catch (error) {
    console.error('Invitation generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      await db.pipelineStage.update({
        where: { sessionId_stageNumber: { sessionId: body.sessionId, stageNumber: 7 } },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(console.error);
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create invitation' 
    }, { status: 500 });
  }
}
