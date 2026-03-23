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

    // Find stages by name (dynamic pipeline)
    const ideaStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'idea' }
    });
    const cjmStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'cjm' }
    });
    const iaStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'ia' }
    });
    const userflowStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'userflow' }
    });
    const prototypeStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'prototype' }
    });

    if (!ideaStage?.outputData) {
      return NextResponse.json({ success: false, error: 'Idea stage not completed' }, { status: 400 });
    }

    if (!prototypeStage) {
      return NextResponse.json({ success: false, error: 'Prototype stage not found in pipeline' }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const cjmData = cjmStage?.outputData ? JSON.parse(cjmStage.outputData) : null;
    const iaData = iaStage?.outputData ? JSON.parse(iaStage.outputData) : null;
    const userflowData = userflowStage?.outputData ? JSON.parse(userflowStage.outputData) : null;

    // Get session and product type
    const session = await db.pipelineSession.findUnique({
      where: { id: sessionId }
    });
    const productType = session?.productType || 'landing';

    await db.pipelineStage.update({
      where: { id: prototypeStage.id },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, cjmData, iaData, userflowData, productType })
      }
    });

    const systemPrompt = `Ты — senior frontend developer. Создай полноценный HTML прототип продукта типа "${productType}".

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
- Создай минимум 2-3 страницы в зависимости от типа продукта
- Используй https://cdn.tailwindcss.com`;

    const userPrompt = `Создай HTML прототип для продукта типа "${productType}" на основе:
    
Идея: ${JSON.stringify(ideaData, null, 2)}
${iaData ? `\nИнформационная архитектура: ${JSON.stringify(iaData, null, 2)}` : ''}
${userflowData ? `\nПользовательские сценарии: ${JSON.stringify(userflowData, null, 2)}` : ''}
${cjmData?.persona ? `\nPersona из CJM: ${JSON.stringify(cjmData.persona, null, 2)}` : ''}`;

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
      where: { id: prototypeStage.id },
      data: {
        status: 'completed',
        outputData: JSON.stringify(prototypeData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: prototypeData,
      productType: productType
    });

  } catch (error) {
    console.error('Prototype generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      const prototypeStage = await db.pipelineStage.findFirst({
        where: { sessionId: body.sessionId, stageName: 'prototype' }
      });
      if (prototypeStage) {
        await db.pipelineStage.update({
          where: { id: prototypeStage.id },
          data: {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create prototype' 
    }, { status: 500 });
  }
}
