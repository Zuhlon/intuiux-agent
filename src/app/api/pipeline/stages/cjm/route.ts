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

    // Find stages by name (not hardcoded number)
    const ideaStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'idea' }
    });
    const competitorsStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'competitors' }
    });
    const cjmStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'cjm' }
    });

    if (!ideaStage?.outputData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Idea stage not completed' 
      }, { status: 400 });
    }

    if (!cjmStage) {
      return NextResponse.json({ 
        success: false, 
        error: 'CJM stage not found in pipeline' 
      }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const competitorsData = competitorsStage?.outputData ? JSON.parse(competitorsStage.outputData) : null;

    await db.pipelineStage.update({
      where: { id: cjmStage.id },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, competitorsData, correction })
      }
    });

    // Get product type for contextual prompts
    const session = await db.pipelineSession.findUnique({
      where: { id: sessionId }
    });
    const productType = session?.productType || 'landing';

    const systemPrompt = `Ты — senior UX researcher. Твоя задача — создать детальную Customer Journey Map для продукта типа "${productType}".

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

    // Generate Mermaid diagram for CJM
    const mermaidCode = generateCJMMermaid(cjmData);

    await db.pipelineStage.update({
      where: { id: cjmStage.id },
      data: {
        status: 'completed',
        outputData: JSON.stringify(cjmData),
        mermaidCode: mermaidCode,
        completedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: cjmData,
      mermaidCode: mermaidCode 
    });

  } catch (error) {
    console.error('CJM generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      const cjmStage = await db.pipelineStage.findFirst({
        where: { sessionId: body.sessionId, stageName: 'cjm' }
      });
      if (cjmStage) {
        await db.pipelineStage.update({
          where: { id: cjmStage.id },
          data: {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create CJM' 
    }, { status: 500 });
  }
}

/**
 * Generate Mermaid diagram for Customer Journey Map
 */
function generateCJMMermaid(cjmData: any): string {
  const lines: string[] = [];
  
  lines.push('```mermaid');
  lines.push('journey');
  lines.push(`    title ${cjmData.persona?.name || 'Пользователь'}: Путь клиента`);
  lines.push('');
  
  const stages = cjmData.journeyStages || [];
  
  stages.forEach((stage: any, index: number) => {
    const sectionName = stage.name || `Этап ${index + 1}`;
    lines.push(`    section ${sectionName}`);
    
    // Add actions as tasks with emotion score
    const actions = stage.userActions || [];
    actions.slice(0, 3).forEach((action: string, actionIndex: number) => {
      const score = stage.emotionScore || 3;
      const safeAction = escapeMermaidText(action);
      lines.push(`      ${safeAction}: ${score}`);
    });
    
    // Add pain points as low-score items
    const pains = stage.painPoints || [];
    if (pains.length > 0) {
      const painText = escapeMermaidText(pains[0]);
      lines.push(`      ⚠️ ${painText}: -2`);
    }
    
    // Add opportunities as positive items
    const opps = stage.opportunities || [];
    if (opps.length > 0) {
      const oppText = escapeMermaidText(opps[0]);
      lines.push(`      ✨ ${oppText}: 4`);
    }
    
    lines.push('');
  });
  
  lines.push('```');
  
  return lines.join('\n');
}

function escapeMermaidText(text: string): string {
  if (!text) return '';
  return text
    .replace(/:/g, ' -')
    .replace(/\n/g, ' ')
    .substring(0, 40);
}
