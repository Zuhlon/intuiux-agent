import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const stages = await db.pipelineStage.findMany({
      where: { sessionId, stageNumber: { in: [1, 3, 4, 5] } },
      orderBy: { stageNumber: 'asc' }
    });

    if (stages.length < 4) {
      return NextResponse.json({ success: false, error: 'Previous stages not completed' }, { status: 400 });
    }

    const ideaData = JSON.parse(stages.find(s => s.stageNumber === 1)?.outputData || '{}');
    const cjmData = JSON.parse(stages.find(s => s.stageNumber === 3)?.outputData || '{}');
    const iaData = JSON.parse(stages.find(s => s.stageNumber === 4)?.outputData || '{}');
    const userflowData = JSON.parse(stages.find(s => s.stageNumber === 5)?.outputData || '{}');

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 6 } },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, cjmData, iaData, userflowData })
      }
    });

    const systemPrompt = `Ты — senior frontend developer. Создай полноценный HTML прототип продукта.

ТРЕБОВАНИЯ:
1. Используй Tailwind CSS (через CDN)
2. Современный, адаптивный дизайн
3. Интерактивные элементы (hover, transitions)
4. Семантическая HTML5 разметка
5. Темная/светлая тема
6. Мобильная адаптация

Ответь в формате JSON:
{
  "pages": [
    {
      "name": "Название страницы",
      "filename": "index.html",
      "html": "ПОЛНЫЙ HTML КОД СЮДА",
      "description": "Описание страницы"
    }
  ],
  "readme": "Описание прототипа для README.md",
  "assets": {
    "favicon": "emoji для favicon",
    "primaryColor": "#цвет",
    "secondaryColor": "#цвет"
  }
}

Важно: 
- Отвечай ТОЛЬКО валидным JSON
- В html поле должен быть ПОЛНЫЙ рабочий HTML документ
- Создай минимум 3 страницы: главная, продукт/услуги, контакты
- Используй https://cdn.tailwindcss.com`;

    const userPrompt = `Создай HTML прототип на основе:
    
Идея: ${JSON.stringify(ideaData, null, 2)}

Информационная архитектура: ${JSON.stringify(iaData, null, 2)}

Пользовательские сценарии: ${JSON.stringify(userflowData, null, 2)}

Persona из CJM: ${JSON.stringify(cjmData?.persona, null, 2)}`;

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let prototypeData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prototypeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      prototypeData = {
        pages: [{
          name: 'Главная',
          filename: 'index.html',
          html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ideaData.title || 'Прототип'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <header class="bg-white shadow-sm">
    <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-800">${ideaData.title || 'Продукт'}</h1>
    </nav>
  </header>
  <main class="container mx-auto px-4 py-12">
    <h2 class="text-3xl font-bold text-gray-800 mb-4">${ideaData.summary || 'Добро пожаловать'}</h2>
  </main>
</body>
</html>`,
          description: 'Главная страница'
        }],
        readme: `# ${ideaData.title || 'Прототип'}`,
        assets: { favicon: '🚀', primaryColor: '#3b82f6', secondaryColor: '#10b981' }
      };
    }

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 6 } },
      data: {
        status: 'completed',
        outputData: JSON.stringify(prototypeData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: prototypeData });

  } catch (error) {
    console.error('Prototype generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      await db.pipelineStage.update({
        where: { sessionId_stageNumber: { sessionId: body.sessionId, stageNumber: 6 } },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(console.error);
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create prototype' 
    }, { status: 500 });
  }
}
