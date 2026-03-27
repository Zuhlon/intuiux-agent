import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';
import ZAI from 'z-ai-web-dev-sdk';
import { 
  analyzeCompetitors, 
  formatCompetitorAnalysisAsMarkdown,
  type CompetitorAnalysisResult 
} from '@/lib/competitor-analyzer';
import { extractIdeaFromText } from '@/lib/idea-extractor';

// Функция веб-поиска конкурентов
async function searchCompetitors(query: string, numResults: number = 10) {
  try {
    const zai = await ZAI.create();
    const results = await zai.functions.invoke('web_search', {
      query: query,
      num: numResults
    });
    return results || [];
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

// Функция анализа сайта конкурента через LLM
async function analyzeCompetitorWebsite(competitorName: string, websiteUrl: string, searchResults: unknown[]) {
  const llm = new LLM();
  
  const context = Array.isArray(searchResults) 
    ? searchResults.map((r: any) => `${r.name}: ${r.snippet}`).join('\n')
    : '';

  const systemPrompt = `Ты — senior business analyst. Проведи SWOT-анализ конкурента на основе найденной информации.

Ответь в формате JSON:
{
  "swot": {
    "strengths": ["Сила 1", "Сила 2", "Сила 3"],
    "weaknesses": ["Слабость 1", "Слабость 2", "Слабость 3"],
    "opportunities": ["Возможность 1", "Возможность 2"],
    "threats": ["Угроза 1", "Угроза 2"]
  },
  "features": ["Ключевая функция 1", "Функция 2", "Функция 3"],
  "pricing": "Модель ценообразования",
  "targetAudience": "Целевая аудитория",
  "marketPosition": "Позиция на рынке",
  "userReviews": "Краткое резюме отзывов пользователей",
  "competitiveAdvantage": "Главное конкурентное преимущество"
}

Важно: отвечай ТОЛЬКО валидным JSON.`;

  const userPrompt = `Конкурент: ${competitorName}
Сайт: ${websiteUrl}

Найденная информация:
${context}

Проведи детальный SWOT-анализ на основе этой информации.`;

  try {
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('SWOT analysis error:', error);
  }

  return null;
}

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

    // Получаем данные этапа идеи (ищем по имени, а не по номеру)
    const ideaStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'idea' }
    });
    const competitorsStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'competitors' }
    });

    if (!ideaStage?.outputData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Idea stage not completed' 
      }, { status: 400 });
    }

    if (!competitorsStage) {
      return NextResponse.json({ 
        success: false, 
        error: 'Competitors stage not found in pipeline' 
      }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    
    // ═══════════════════════════════════════════════════════════════
    // ПРИОРИТЕТ: Используем алгоритмический competitor-analyzer
    // Это обеспечивает уникальный SWOT для каждого конкурента
    // ═══════════════════════════════════════════════════════════════
    
    // Попробуем получить исходный текст из inputData
    let sourceText = '';
    try {
      const ideaInput = ideaStage.inputData ? JSON.parse(ideaStage.inputData) : {};
      sourceText = ideaInput.inputText || '';
    } catch (e) {
      console.log('[Competitors] Could not parse idea input data');
    }
    
    // Извлекаем структурированную идею для competitor-analyzer
    const extractedIdea = sourceText ? extractIdeaFromText(sourceText) : null;
    
    console.log(`[Competitors] ideaData.title: "${ideaData.title}"`);
    console.log(`[Competitors] extractedIdea.name: "${extractedIdea?.name}"`);
    console.log(`[Competitors] extractedIdea.industry: "${extractedIdea?.industry}"`);
    
    // Если удалось извлечь идею с отраслью - используем алгоритмический анализ
    if (extractedIdea && extractedIdea.industry) {
      console.log('[Competitors] Using algorithmic competitor-analyzer');
      
      try {
        const analysis = analyzeCompetitors(extractedIdea);
        const markdownOutput = formatCompetitorAnalysisAsMarkdown(analysis);
        
        // Преобразуем в формат пайплайна
        const competitorsData = {
          productName: analysis.productName,
          industryName: analysis.industryName,
          marketSize: analysis.marketSize,
          marketTrends: analysis.marketTrends,
          directCompetitors: analysis.directCompetitors.map(c => ({
            name: c.name,
            url: c.url,
            country: c.country,
            description: c.description,
            features: c.features,
            pricing: c.pricing,
            targetAudience: c.targetAudience,
            swotHtml: c.swotHtml,
            strengths: c.scores.functionality ? `Функциональность: ${'⭐'.repeat(c.scores.functionality)}` : '',
            weaknesses: '',
            opportunities: '',
            threats: '',
            marketPosition: '',
            countryOrigin: c.country
          })),
          indirectCompetitors: analysis.indirectCompetitors,
          comparisonTable: analysis.comparisonTable,
          differentiationStrategy: analysis.differentiationOpportunities.join('\n'),
          competitiveAdvantages: analysis.differentiationOpportunities,
          positioningRecommendation: analysis.positioningRecommendation,
          markdownOutput: markdownOutput,
          searchPerformed: false,
          algorithmicAnalysis: true,
          searchDate: new Date().toISOString()
        };
        
        // Сохраняем результат
        await db.pipelineStage.update({
          where: { id: competitorsStage.id },
          data: {
            status: 'completed',
            outputData: JSON.stringify(competitorsData),
            completedAt: new Date()
          }
        });
        
        return NextResponse.json({ success: true, data: competitorsData });
        
      } catch (algoError) {
        console.error('[Competitors] Algorithmic analysis failed, falling back to web search:', algoError);
        // Продолжаем с веб-поиском
      }
    }
    
    console.log('[Competitors] Falling back to web search + LLM analysis');

    // Обновляем статус этапа
    await db.pipelineStage.update({
      where: { id: competitorsStage.id },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, correction })
      }
    });

    const llm = new LLM();
    let competitorsData: any = {
      directCompetitors: [],
      indirectCompetitors: [],
      marketAnalysis: {
        marketSize: '',
        growthTrends: '',
        barriers: [],
        opportunities: []
      },
      differentiationStrategy: '',
      competitiveAdvantages: [],
      searchPerformed: true,
      searchDate: new Date().toISOString()
    };

    // Формируем поисковые запросы
    const searchKeywords = ideaData.searchKeywords || [];
    const productTitle = ideaData.title || '';
    
    // Поиск российских конкурентов
    const russianQuery = `${productTitle} ${searchKeywords.join(' ')} конкуренты аналоги Россия сайт`;
    console.log('[Competitors] Searching Russian competitors:', russianQuery);
    const russianResults = await searchCompetitors(russianQuery, 10);
    
    // Поиск зарубежных конкурентов
    const internationalQuery = `${productTitle} ${searchKeywords.join(' ')} competitors alternatives software`;
    console.log('[Competitors] Searching international competitors:', internationalQuery);
    const internationalResults = await searchCompetitors(internationalQuery, 10);

    // Объединяем результаты поиска
    const allSearchResults = [...russianResults, ...internationalResults];
    console.log('[Competitors] Total search results:', allSearchResults.length);

    // Если есть корректировка с указанием конкретных конкурентов - ищем их
    let additionalSearchResults: any[] = [];
    if (correction) {
      // Извлекаем названия конкурентов из корректировки
      const extractPrompt = `Извлеки названия конкурентов из текста. Верни JSON массив названий.
Текст: ${correction}
Формат: ["Название 1", "Название 2"]`;
      
      const extractResponse = await llm.chat({
        messages: [{ role: 'user', content: extractPrompt }],
        temperature: 0.3
      });

      try {
        const namesMatch = extractResponse.match(/\[.*\]/);
        if (namesMatch) {
          const competitorNames = JSON.parse(namesMatch[0]);
          console.log('[Competitors] Extracted competitor names:', competitorNames);
          
          for (const name of competitorNames) {
            const nameSearch = await searchCompetitors(`${name} официальный сайт`, 5);
            additionalSearchResults.push(...nameSearch);
          }
        }
      } catch (e) {
        console.error('Failed to extract competitor names:', e);
      }
    }

    // Генерируем структуру конкурентов с помощью LLM на основе найденной информации
    const searchContext = allSearchResults.slice(0, 15).map((r: any) => 
      `- ${r.name}: ${r.snippet} (${r.url})`
    ).join('\n');

    const systemPrompt = `Ты — senior product analyst. Твоя задача — провести конкурентный анализ на основе результатов веб-поиска.

Проанализируй найденные результаты и выдели:
- 3 прямых конкурента (решают ту же проблему для той же аудитории)
- 3 косвенных конкурента (решают смежные проблемы или для другой аудитории)

Для каждого конкурента укажи реальный сайт из результатов поиска.

Ответь в формате JSON:
{
  "directCompetitors": [
    {
      "name": "Название",
      "url": "сайт из результатов поиска",
      "description": "Описание продукта",
      "strengths": ["сила 1", "сила 2"],
      "weaknesses": ["слабость 1", "слабость 2"],
      "features": ["функция 1", "функция 2"],
      "targetAudience": "Целевая аудитория",
      "pricing": "Модель ценообразования",
      "marketPosition": "Позиция на рынке",
      "country": "Страна происхождения"
    }
  ],
  "indirectCompetitors": [
    {
      "name": "Название",
      "description": "Почему это косвенный конкурент",
      "overlap": "Пересечение с нашим продуктом",
      "differentiation": "Ключевые отличия"
    }
  ],
  "marketAnalysis": {
    "marketSize": "Размер рынка (оценка)",
    "growthTrends": "Тренды роста",
    "barriers": ["Барьер входа 1", "Барьер 2"],
    "opportunities": ["Возможность 1", "Возможность 2"]
  },
  "differentiationStrategy": "Стратегия дифференциации для нашего продукта",
  "competitiveAdvantages": ["Преимущество 1", "Преимущество 2", "Преимущество 3"]
}

Важно: 
- Используй реальные URL из результатов поиска
- Отвечай ТОЛЬКО валидным JSON
- Указывай страну происхождения конкурента`;

    const userPrompt = `Идея продукта:
${JSON.stringify(ideaData, null, 2)}

Результаты веб-поиска конкурентов:
${searchContext}

${correction ? `Корректировка от пользователя:\n${correction}` : ''}

Проанализируй результаты поиска и создай детальный конкурентный анализ. Определи прямых и косвенных конкурентов.`;

    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5
    });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        competitorsData = {
          ...parsedData,
          searchPerformed: true,
          searchDate: new Date().toISOString(),
          searchResultsCount: allSearchResults.length
        };
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', response);
    }

    // Если есть корректировка и указаны конкретные конкуренты - делаем SWOT анализ
    if (correction && competitorsData.directCompetitors) {
      for (let i = 0; i < competitorsData.directCompetitors.length; i++) {
        const competitor = competitorsData.directCompetitors[i];
        if (competitor.url) {
          console.log(`[Competitors] Analyzing website for ${competitor.name}`);
          const competitorSearch = await searchCompetitors(`${competitor.name} отзывы особенности`, 5);
          const swotAnalysis = await analyzeCompetitorWebsite(
            competitor.name,
            competitor.url,
            competitorSearch
          );
          
          if (swotAnalysis) {
            competitorsData.directCompetitors[i] = {
              ...competitor,
              ...swotAnalysis,
              swotAnalysisPerformed: true
            };
          }
        }
      }
    }

    // Сохраняем результат
    await db.pipelineStage.update({
      where: { id: competitorsStage.id },
      data: {
        status: 'completed',
        outputData: JSON.stringify(competitorsData),
        completedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: competitorsData });

  } catch (error) {
    console.error('Competitors analysis error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      const competitorsStage = await db.pipelineStage.findFirst({
        where: { sessionId: body.sessionId, stageName: 'competitors' }
      });
      if (competitorsStage) {
        await db.pipelineStage.update({
          where: { id: competitorsStage.id },
          data: {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to analyze competitors' 
    }, { status: 500 });
  }
}
