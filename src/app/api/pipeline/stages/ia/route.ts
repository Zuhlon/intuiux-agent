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

    if (!ideaStage?.outputData || !cjmStage?.outputData) {
      return NextResponse.json({ success: false, error: 'Previous stages not completed' }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const cjmData = JSON.parse(cjmStage.outputData);

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 4 } },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, cjmData, correction })
      }
    });

    const systemPrompt = `Ты — senior information architect. Создай информационную архитектуру продукта.

Ответь в формате JSON:
{
  "structure": {
    "mainNavigation": [
      {
        "label": "Название пункта меню",
        "url": "/путь",
        "children": []
      }
    ],
    "pages": [
      {
        "name": "Название страницы",
        "url": "/путь",
        "description": "Описание страницы",
        "sections": [
          {
            "name": "Название секции",
            "components": ["Компонент 1", "Компонент 2"]
          }
        ],
        "metadata": {
          "title": "SEO заголовок",
          "description": "SEO описание"
        }
      }
    ]
  },
  "siteMap": {
    "levels": 3,
    "description": "Описание структуры сайта"
  },
  "navigationPrinciples": ["Принцип 1", "Принцип 2"],
  "contentStrategy": {
    "primaryContent": ["Контент 1", "Контент 2"],
    "secondaryContent": ["Контент 1"],
    "ctas": ["CTA 1", "CTA 2"]
  },
  "userFlows": ["Поток 1", "Поток 2"]
}

Важно: отвечай ТОЛЬКО валидным JSON.`;

    const userPrompt = correction
      ? `Идея:\n${JSON.stringify(ideaData, null, 2)}\n\nCJM:\n${JSON.stringify(cjmData, null, 2)}\n\nКорректировка:\n${correction}`
      : `Создай информационную архитектуру на основе:\n\nИдея:\n${JSON.stringify(ideaData, null, 2)}\n\nCJM:\n${JSON.stringify(cjmData, null, 2)}`;

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let iaData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        iaData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      iaData = {
        structure: { mainNavigation: [], pages: [] },
        siteMap: { levels: 0, description: '' },
        navigationPrinciples: [],
        contentStrategy: { primaryContent: [], secondaryContent: [], ctas: [] },
        userFlows: []
      };
    }

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 4 } },
      data: {
        status: 'completed',
        outputData: JSON.stringify(iaData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: iaData });

  } catch (error) {
    console.error('IA generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      await db.pipelineStage.update({
        where: { sessionId_stageNumber: { sessionId: body.sessionId, stageNumber: 4 } },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(console.error);
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create IA' 
    }, { status: 500 });
  }
}
