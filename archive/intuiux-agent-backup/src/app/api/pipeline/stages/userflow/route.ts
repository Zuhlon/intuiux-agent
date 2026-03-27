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

    if (!ideaStage?.outputData) {
      return NextResponse.json({ success: false, error: 'Idea stage not completed' }, { status: 400 });
    }

    if (!userflowStage) {
      return NextResponse.json({ success: false, error: 'Userflow stage not found in pipeline' }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const cjmData = cjmStage?.outputData ? JSON.parse(cjmStage.outputData) : null;
    const iaData = iaStage?.outputData ? JSON.parse(iaStage.outputData) : null;

    await db.pipelineStage.update({
      where: { id: userflowStage.id },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, cjmData, iaData, correction })
      }
    });

    // Get product type
    const session = await db.pipelineSession.findUnique({
      where: { id: sessionId }
    });
    const productType = session?.productType || 'landing';

    const systemPrompt = `Ты — senior UX designer. Создай детальные пользовательские сценарии (userflows) для продукта типа "${productType}".

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
      ? `Идея:\n${JSON.stringify(ideaData, null, 2)}\n${cjmData ? `\nCJM:\n${JSON.stringify(cjmData, null, 2)}` : ''}\n${iaData ? `\nIA:\n${JSON.stringify(iaData, null, 2)}` : ''}\n\nКорректировка:\n${correction}`
      : `Создай пользовательские сценарии на основе:\n\nИдея:\n${JSON.stringify(ideaData, null, 2)}${cjmData ? `\n\nCJM:\n${JSON.stringify(cjmData, null, 2)}` : ''}${iaData ? `\n\nIA:\n${JSON.stringify(iaData, null, 2)}` : ''}`;

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

    // Generate Mermaid diagram
    const mermaidCode = generateUserflowMermaid(userflowData);

    await db.pipelineStage.update({
      where: { id: userflowStage.id },
      data: {
        status: 'completed',
        outputData: JSON.stringify(userflowData),
        mermaidCode: mermaidCode,
        completedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: userflowData,
      mermaidCode: mermaidCode 
    });

  } catch (error) {
    console.error('Userflow generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      const userflowStage = await db.pipelineStage.findFirst({
        where: { sessionId: body.sessionId, stageName: 'userflow' }
      });
      if (userflowStage) {
        await db.pipelineStage.update({
          where: { id: userflowStage.id },
          data: {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create userflow' 
    }, { status: 500 });
  }
}

/**
 * Generate Mermaid flowchart for Userflows
 */
function generateUserflowMermaid(userflowData: any): string {
  const lines: string[] = [];
  
  lines.push('```mermaid');
  lines.push('flowchart TD');
  lines.push('');
  
  const scenarios = userflowData.scenarios || [];
  const interactions = userflowData.interactions || [];
  
  // Generate scenarios as subgraphs
  scenarios.forEach((scenario: any, sIndex: number) => {
    const safeName = escapeMermaidText(scenario.name || `Сценарий ${sIndex + 1}`);
    lines.push(`    subgraph s${sIndex} ["${safeName}"]`);
    
    const steps = scenario.steps || [];
    steps.forEach((step: any, stepIndex: number) => {
      const nodeId = `s${sIndex}_step${stepIndex}`;
      const action = escapeMermaidText(step.action || 'Действие');
      const system = escapeMermaidText(step.system || '');
      
      if (system) {
        lines.push(`        ${nodeId}["${action}<br/><small>→ ${system}</small>"]`);
      } else {
        lines.push(`        ${nodeId}["${action}"]`);
      }
      
      // Connect to previous step
      if (stepIndex > 0) {
        lines.push(`        s${sIndex}_step${stepIndex - 1} --> ${nodeId}`);
      }
    });
    
    lines.push('    end');
    lines.push('');
  });
  
  // Generate interactions between scenarios
  if (interactions.length > 0) {
    lines.push('    %% Переходы между экранами');
    interactions.slice(0, 5).forEach((interaction: any, iIndex: number) => {
      const from = escapeMermaidText(interaction.from || 'Экран A');
      const to = escapeMermaidText(interaction.to || 'Экран Б');
      const trigger = escapeMermaidText(interaction.trigger || '');
      
      lines.push(`    i${iIndex}_from["${from}"]`);
      lines.push(`    i${iIndex}_to["${to}"]`);
      lines.push(`    i${iIndex}_from -->|"${trigger}"| i${iIndex}_to`);
    });
  }
  
  // Styling
  lines.push('');
  lines.push('    %% Стили');
  lines.push('    classDef step fill:#3b82f6,stroke:#1d4ed8,color:#fff');
  lines.push('    classDef screen fill:#10b981,stroke:#059669,color:#fff');
  
  lines.push('```');
  
  return lines.join('\n');
}

function escapeMermaidText(text: string): string {
  if (!text) return '';
  return text
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, ' ')
    .substring(0, 50);
}
