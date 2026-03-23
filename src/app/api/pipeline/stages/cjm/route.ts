import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';
import { 
  generateCJM, 
  generateCJMMermaid, 
  formatCJMAsMarkdown,
  CustomerJourneyMap 
} from '@/lib/cjm-generator';

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

    // Find stages by name
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

    // Get product type and transcript context
    const session = await db.pipelineSession.findUnique({
      where: { id: sessionId }
    });
    const productType = session?.productType || 'landing';
    const transcriptContext = session?.transcriptionText || '';

    console.log('[CJM v2.0] Starting generation for:', ideaData.name);
    console.log('[CJM] Product type:', productType);
    console.log('[CJM] Has transcript context:', !!transcriptContext);

    // === Step 1: Generate base CJM using algorithm ===
    const baseCJM = generateCJM(
      {
        name: ideaData.name || 'Продукт',
        description: ideaData.description || '',
        functions: ideaData.functions || [],
        userTypes: ideaData.userTypes || ideaData.user_types || '',
        valueProposition: ideaData.valueProposition || ideaData.value_proposition || '',
        industry: ideaData.industry,
        transcriptContext
      },
      productType,
      competitorsData ? {
        directCompetitors: competitorsData.directCompetitors,
        differentiationOpportunities: competitorsData.differentiationOpportunities
      } : undefined
    );

    console.log('[CJM] Base CJM generated with', baseCJM.stages.length, 'stages');

    // === Step 2: Enhance CJM with LLM for context-aware content ===
    let enhancedCJM = baseCJM;
    
    try {
      enhancedCJM = await enhanceCJMWithLLM(
        baseCJM, 
        ideaData, 
        productType, 
        transcriptContext,
        correction
      );
      console.log('[CJM] CJM enhanced with LLM');
    } catch (llmError) {
      console.log('[CJM] LLM enhancement failed, using base CJM:', llmError);
    }

    // === Step 3: Generate Mermaid diagram ===
    const mermaidCode = generateCJMMermaid(enhancedCJM);

    // === Step 4: Generate markdown output ===
    const markdownOutput = formatCJMAsMarkdown(enhancedCJM);

    // Save to database
    await db.pipelineStage.update({
      where: { id: cjmStage.id },
      data: {
        status: 'completed',
        outputData: JSON.stringify(enhancedCJM),
        mermaidCode: mermaidCode,
        completedAt: new Date()
      }
    });

    console.log('[CJM] CJM generation completed successfully');

    return NextResponse.json({ 
      success: true, 
      data: enhancedCJM,
      mermaidCode: mermaidCode,
      markdown: markdownOutput
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
 * Enhance CJM with LLM for more contextual and specific content
 * Uses professional CJM methodology prompts
 */
async function enhanceCJMWithLLM(
  baseCJM: CustomerJourneyMap,
  ideaData: any,
  productType: string,
  transcriptContext?: string,
  correction?: string
): Promise<CustomerJourneyMap> {
  const llm = new LLM();

  // Professional CJM system prompt based on UXPressia, RightHook, UX Planet methodology
  const systemPrompt = `Ты — Senior UX Researcher с 15-летним опытом создания Customer Journey Maps для крупнейших компаний.

Твоя методология основана на профессиональных стандартах:
1. UXPressia — customer-centric подход
2. RightHook Studio — step-by-step методология
3. UX Journal — data-driven подход
4. UX Planet — comprehensive elements
5. Visual Paradigm — visual representation

КЛЮЧЕВЫЕ ПРИНЦИПЫ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ КОНКРЕТНОСТЬ:
- НЕ используй общие фразы типа "пользователь ищет информацию"
- ИСПОЛЬЗУЙ конкретные действия: "пользователь вводит запрос 'как автоматизировать отчёты'"

✅ КОНТЕКСТ:
- Все данные из транскрипции обсуждения
- Учитывай специфику продукта и отрасли
- Привязывай к реальным функциям

✅ ЭМОЦИИ:
- Каждая эмоция имеет триггер
- Интенсивность обоснована ситуацией
- Эмоциональная дуга имеет логику

✅ БОЛИ:
- Конкретные, а не абстрактные
- С источником информации
- С частотой появления

✅ ВОЗМОЖНОСТИ:
- Actionable (можно выполнить)
- С приоритетом
- С ожидаемым эффектом

❌ ЗАПРЕЩЕНО:
- Шаблонные фразы без контекста
- Выдуманные данные
- Поверхностные рекомендации`;

  const userPrompt = `КОНТЕКСТ ПРОДУКТА:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Название: ${ideaData.name}
Описание: ${ideaData.description}
Функции: ${JSON.stringify(ideaData.functions || [])}
Целевая аудитория: ${ideaData.userTypes || ideaData.user_types}
Ценностное предложение: ${ideaData.valueProposition || ideaData.value_proposition}
Тип продукта: ${productType}
Отрасль: ${ideaData.industry || 'не указана'}

${transcriptContext ? `
КОНТЕКСТ ИЗ ТРАНСКРИПЦИИ ОБСУЖДЕНИЯ:
${transcriptContext.substring(0, 2000)}
` : ''}
${correction ? `
КОРРЕКТИРОВКА ОТ ПОЛЬЗОВАТЕЛЯ:
${correction}
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ТЕКУЩАЯ CJM ДЛЯ УЛУЧШЕНИЯ:
${JSON.stringify(baseCJM.stages.map(s => ({
  name: s.name,
  order: s.order,
  userActions: s.userActions,
  thinking: s.thinking,
  questions: s.questions,
  emotions: s.emotions,
  painPoints: s.painPoints,
  opportunities: s.opportunities.map(o => o.opportunity)
})), null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ЗАДАЧА:
Улучши каждый этап CJM, сделав его максимально конкретным для этого продукта.

Для каждого этапа верни JSON:
{
  "order": <номер этапа>,
  "userActions": [
    "Конкретное действие 1 (не шаблонное!)",
    "Конкретное действие 2"
  ],
  "thinking": [
    "Конкретная мысль пользователя с упоминанием продукта/функции",
    "Вторая мысль"
  ],
  "questions": [
    "Конкретный вопрос о продукте",
    "Второй вопрос"
  ],
  "emotions": {
    "primary": "название эмоции",
    "intensity": число от -5 до +5,
    "description": "описание",
    "triggers": ["триггер 1", "триггер 2"]
  },
  "painPoints": [
    {
      "point": "конкретная боль для этого продукта",
      "severity": "low|medium|high",
      "source": "откуда известно"
    }
  ],
  "opportunities": [
    {
      "opportunity": "конкретная возможность для этого продукта",
      "impact": "low|medium|high",
      "effort": "low|medium|high"
    }
  ]
}

Верни JSON массив улучшенных этапов. Каждый элемент должен быть специфичен для продукта "${ideaData.name}".`;

  try {
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    // Parse LLM response - look for JSON array
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const enhancedStages = JSON.parse(jsonMatch[0]);
      
      // Merge enhanced content with base CJM
      for (const enhanced of enhancedStages) {
        const stageIndex = baseCJM.stages.findIndex(s => s.order === enhanced.order || s.name === enhanced.name);
        if (stageIndex === -1) continue;
        
        const stage = baseCJM.stages[stageIndex];

        // Update user actions
        if (enhanced.userActions && Array.isArray(enhanced.userActions)) {
          stage.userActions = enhanced.userActions.slice(0, 4);
        }
        
        // Update thinking
        if (enhanced.thinking && Array.isArray(enhanced.thinking)) {
          stage.thinking = enhanced.thinking.slice(0, 3);
        }
        
        // Update questions
        if (enhanced.questions && Array.isArray(enhanced.questions)) {
          stage.questions = enhanced.questions.slice(0, 3);
        }
        
        // Update emotions
        if (enhanced.emotions) {
          stage.emotions = {
            primary: enhanced.emotions.primary || stage.emotions.primary,
            intensity: typeof enhanced.emotions.intensity === 'number' 
              ? Math.max(-5, Math.min(5, enhanced.emotions.intensity)) 
              : stage.emotions.intensity,
            description: enhanced.emotions.description || stage.emotions.description,
            triggers: enhanced.emotions.triggers || []
          };
        }
        
        // Update pain points
        if (enhanced.painPoints && Array.isArray(enhanced.painPoints)) {
          stage.painPoints = enhanced.painPoints.map((p: any) => ({
            point: typeof p === 'string' ? p : p.point,
            severity: p.severity || 'medium',
            source: p.source || 'Анализ LLM',
            frequency: p.frequency
          })).slice(0, 3);
        }
        
        // Update opportunities
        if (enhanced.opportunities && Array.isArray(enhanced.opportunities)) {
          stage.opportunities = enhanced.opportunities.map((o: any) => ({
            opportunity: typeof o === 'string' ? o : o.opportunity,
            impact: o.impact || 'medium',
            effort: o.effort || 'medium',
            implementation: o.implementation || 'AI рекомендация'
          })).slice(0, 4);
        }
      }

      // Recalculate derived data
      baseCJM.keyInsights = extractKeyInsightsFromStages(baseCJM.stages);
      baseCJM.recommendations = extractRecommendationsFromStages(baseCJM.stages);
      baseCJM.momentsOfTruth = extractMomentsOfTruthFromStages(baseCJM.stages);
      baseCJM.emotionalArc = recalculateEmotionalArc(baseCJM.stages);
    }

    return baseCJM;
  } catch (error) {
    console.log('[CJM] LLM enhancement failed:', error);
    return baseCJM;
  }
}

/**
 * Extract key insights from enhanced stages
 */
function extractKeyInsightsFromStages(stages: any[]): CustomerJourneyMap['keyInsights'] {
  const insights: CustomerJourneyMap['keyInsights'] = [];

  // Find critical pain points
  for (const stage of stages) {
    const criticalPains = stage.painPoints?.filter((p: any) => p.severity === 'high') || [];
    if (criticalPains.length > 0) {
      insights.push({
        insight: `Критические боли на "${stage.name}": ${criticalPains.map((p: any) => p.point).join(', ')}`,
        stage: stage.name,
        priority: 'critical',
        evidence: `${criticalPains.length} критических проблем`
      });
    }
  }

  // Find emotional lows
  for (const stage of stages) {
    if (stage.emotions?.intensity < 0) {
      insights.push({
        insight: `Негативная эмоция на "${stage.name}": ${stage.emotions.description}`,
        stage: stage.name,
        priority: 'important',
        evidence: `Эмоциональный уровень: ${stage.emotions.intensity}`
      });
    }
  }

  // Find high-impact opportunities
  for (const stage of stages) {
    const highImpactOpps = stage.opportunities?.filter((o: any) => o.impact === 'high') || [];
    if (highImpactOpps.length > 0) {
      insights.push({
        insight: `Потенциал на "${stage.name}": ${highImpactOpps[0].opportunity}`,
        stage: stage.name,
        priority: 'important',
        evidence: 'Высокий ожидаемый эффект'
      });
    }
  }

  return insights.slice(0, 5);
}

/**
 * Extract recommendations from enhanced stages
 */
function extractRecommendationsFromStages(stages: any[]): CustomerJourneyMap['recommendations'] {
  const recommendations: CustomerJourneyMap['recommendations'] = [];

  // Quick wins: high impact, low effort
  for (const stage of stages) {
    const quickWins = stage.opportunities?.filter(
      (o: any) => o.impact === 'high' && o.effort === 'low'
    ) || [];
    
    for (const win of quickWins) {
      recommendations.push({
        recommendation: win.opportunity,
        rationale: `Быстрая победа на "${stage.name}"`,
        expectedImpact: 'Высокий эффект при низких затратах',
        quickWin: true
      });
    }
  }

  // Prioritize stages with most pain points
  const painfulStages = [...stages]
    .sort((a, b) => (b.painPoints?.length || 0) - (a.painPoints?.length || 0))
    .slice(0, 2);

  for (const stage of painfulStages) {
    if (stage.painPoints?.length > 0) {
      recommendations.push({
        recommendation: `Устранить: ${stage.painPoints[0].point}`,
        rationale: `Приоритетный этап "${stage.name}" (${stage.painPoints.length} проблем)`,
        expectedImpact: 'Улучшение пользовательского опыта',
        quickWin: false
      });
    }
  }

  return recommendations.slice(0, 6);
}

/**
 * Extract moments of truth from enhanced stages
 */
function extractMomentsOfTruthFromStages(stages: any[]): CustomerJourneyMap['momentsOfTruth'] {
  const moments: CustomerJourneyMap['momentsOfTruth'] = [];

  for (const stage of stages) {
    // Critical touchpoints
    const criticalTouchpoints = stage.touchpoints?.filter((t: any) => t.importance === 'critical') || [];
    for (const tp of criticalTouchpoints) {
      moments.push({
        stage: stage.name,
        moment: tp.channel,
        currentExperience: tp.description,
        improvementPotential: stage.opportunities?.[0]?.opportunity || 'Оптимизировать',
        emotionalImpact: stage.emotions?.intensity || 0
      });
    }

    // Emotional peaks
    if (stage.emotions && Math.abs(stage.emotions.intensity) >= 3) {
      moments.push({
        stage: stage.name,
        moment: `Эмоциональный пик: ${stage.emotions.description}`,
        currentExperience: stage.emotions.primary,
        improvementPotential: stage.emotions.intensity < 0 
          ? stage.opportunities?.[0]?.opportunity || 'Снизить негатив'
          : 'Усилить позитив',
        emotionalImpact: stage.emotions.intensity
      });
    }
  }

  return moments.slice(0, 5);
}

/**
 * Recalculate emotional arc
 */
function recalculateEmotionalArc(stages: any[]): CustomerJourneyMap['emotionalArc'] {
  if (stages.length === 0) {
    return {
      startPoint: 0,
      lowestPoint: { stage: 'N/A', value: 0, reason: 'Нет данных' },
      highestPoint: { stage: 'N/A', value: 0, reason: 'Нет данных' },
      overallTrend: 'mixed'
    };
  }

  const startPoint = stages[0].emotions?.intensity || 0;
  
  const lowestStage = stages.reduce((min, s) => 
    (s.emotions?.intensity ?? 0) < (min.emotions?.intensity ?? 0) ? s : min
  );
  
  const highestStage = stages.reduce((max, s) => 
    (s.emotions?.intensity ?? 0) > (max.emotions?.intensity ?? 0) ? s : max
  );

  const lastIntensity = stages[stages.length - 1].emotions?.intensity || 0;
  let overallTrend: 'improving' | 'declining' | 'mixed';
  
  if (lastIntensity > startPoint + 1) {
    overallTrend = 'improving';
  } else if (lastIntensity < startPoint - 1) {
    overallTrend = 'declining';
  } else {
    overallTrend = 'mixed';
  }

  return {
    startPoint,
    lowestPoint: {
      stage: lowestStage.name,
      value: lowestStage.emotions?.intensity || 0,
      reason: lowestStage.emotions?.description || ''
    },
    highestPoint: {
      stage: highestStage.name,
      value: highestStage.emotions?.intensity || 0,
      reason: highestStage.emotions?.description || ''
    },
    overallTrend
  };
}
