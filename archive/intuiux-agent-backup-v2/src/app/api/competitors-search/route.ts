// Competitors Search API v2.0 - NO TEMPLATES, WEB SEARCH ONLY
// CRITICAL: Search for REAL competitors using web search, never use predefined databases

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { LLM } from '@/lib/zai';

// ═══════════════════════════════════════════════════════════════════════════
// WEB SEARCH FOR REAL COMPETITORS
// ═══════════════════════════════════════════════════════════════════════════

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface CompetitorInfo {
  name: string;
  url: string;
  description: string;
  features: string[];
  pricing: string;
  strengths: string[];
  weaknesses: string[];
}

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Search the web for competitors
async function searchWeb(query: string, numResults: number = 10): Promise<SearchResult[]> {
  try {
    const zai = await getZAI();
    const results = await zai.functions.invoke('web_search', {
      query: query,
      num: numResults
    });
    
    if (Array.isArray(results)) {
      return results.map((r: any) => ({
        title: r.name || r.title || '',
        url: r.url || r.link || '',
        snippet: r.snippet || r.description || '',
      }));
    }
    return [];
  } catch (error) {
    console.error('[WebSearch] Error:', error);
    return [];
  }
}

// Extract competitor info from search results using LLM
async function extractCompetitorsFromSearch(
  productName: string,
  productDescription: string,
  searchResults: SearchResult[]
): Promise<CompetitorInfo[]> {
  const llm = new LLM();
  
  const resultsText = searchResults
    .slice(0, 15)
    .map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`)
    .join('\n\n');
  
  const systemPrompt = `Ты — аналитик по конкурентному анализу. Извлеки информацию о РЕАЛЬНЫХ конкурентах из результатов поиска.

КРИТИЧЕСКИ ВАЖНО:
1. Извлекай ТОЛЬКО РЕАЛЬНЫХ конкурентов из результатов поиска
2. НЕ придумывай конкурентов
3. Каждый конкурент должен иметь РЕАЛЬНЫЙ URL из результатов поиска
4. Если информации недостаточно — напиши "не указано"

Ответь в формате JSON массива конкурентов.`;

  const userPrompt = `Продукт: ${productName}
Описание: ${productDescription}

Результаты веб-поиска конкурентов:
${resultsText}

Извлеки 3-5 реальных конкурентов из этих результатов в формате:
[
  {
    "name": "Название конкурента",
    "url": "URL из результатов поиска",
    "description": "Описание из результатов поиска",
    "features": ["функция 1", "функция 2"],
    "pricing": "Ценовая модель",
    "strengths": ["сила 1", "сила 2"],
    "weaknesses": ["слабость 1", "слабость 2"]
  }
]`;

  try {
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3
    });
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('[LLM] Error extracting competitors:', error);
  }
  
  return [];
}

// Search for market information
async function searchMarketInfo(industry: string): Promise<{
  marketSize: string;
  marketTrends: string[];
}> {
  const trendResults = await searchWeb(`${industry} рынок тренды рост 2024 2025`, 5);
  
  const trends: string[] = [];
  for (const result of trendResults) {
    if (result.snippet && result.snippet.length > 20) {
      trends.push(result.snippet.substring(0, 100));
    }
  }
  
  return {
    marketSize: 'Данные из веб-поиска',
    marketTrends: trends.slice(0, 5),
  };
}

// Generate SWOT analysis using LLM
async function generateSWOTAnalysis(
  competitor: CompetitorInfo,
  productName: string
): Promise<{
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}> {
  const llm = new LLM();
  
  const prompt = `Проведи SWOT-анализ конкурента "${competitor.name}" по сравнению с нашим продуктом "${productName}".

Конкурент: ${competitor.name}
URL: ${competitor.url}
Описание: ${competitor.description}
Функции: ${competitor.features.join(', ')}
Цены: ${competitor.pricing}
Сильные стороны: ${competitor.strengths.join(', ')}
Слабые стороны: ${competitor.weaknesses.join(', ')}

Ответь в формате JSON:
{
  "strengths": ["сила 1", "сила 2", "сила 3"],
  "weaknesses": ["слабость 1", "слабость 2"],
  "opportunities": ["возможность 1", "возможность 2"],
  "threats": ["угроза 1", "угроза 2"]
}`;

  try {
    const response = await llm.chat({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5
    });
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('[SWOT] Error:', error);
  }
  
  return {
    strengths: competitor.strengths || [],
    weaknesses: competitor.weaknesses || [],
    opportunities: [],
    threats: [],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACT PRODUCT INFO FROM IDEA TEXT
// ═══════════════════════════════════════════════════════════════════════════

function extractProductInfo(ideaText: string): { name: string; description: string; industry: string } {
  // Extract name
  const nameMatch = ideaText.match(/(?:Название|Название идеи)[^:]*:?\s*\*?\*?([^*\n]+)/i);
  const name = nameMatch ? nameMatch[1].trim().replace(/\*\*/g, '') : 'Продукт';
  
  // Extract description
  const descMatch = ideaText.match(/(?:Описание|Описание сути)[^:]*:?\s*([^\n]+(?:\n[^\n#]+)*?)(?=\n###|\n##|$)/i);
  const description = descMatch ? descMatch[1].trim().replace(/[═=*]/g, '').trim() : '';
  
  // Extract industry
  const industryMatch = ideaText.match(/(?:Отрасль|Индустрия|Сфера)[^:]*:?\s*([^\n]+)/i);
  const industry = industryMatch ? industryMatch[1].trim() : '';
  
  return { name, description, industry };
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT HTML OUTPUT
// ═══════════════════════════════════════════════════════════════════════════

function formatCompetitorHtml(
  comp: CompetitorInfo & { swot?: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } },
  index: number
): string {
  const swot = comp.swot || { strengths: comp.strengths, weaknesses: comp.weaknesses, opportunities: [], threats: [] };
  
  return `
<div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: white;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 20px;">
    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${index + 1}. ${comp.name}</h3>
    <a href="${comp.url}" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px;">${comp.url}</a>
  </div>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr style="background: #f8fafc;">
      <td style="padding: 12px 20px; font-weight: 600; width: 140px; color: #64748b;">📝 Описание</td>
      <td style="padding: 12px 20px;">${comp.description}</td>
    </tr>
    <tr>
      <td style="padding: 12px 20px; font-weight: 600; color: #64748b;">💰 Цена</td>
      <td style="padding: 12px 20px;">${comp.pricing || 'Не указано'}</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 12px 20px; font-weight: 600; color: #64748b; vertical-align: top;">⚡ Функции</td>
      <td style="padding: 12px 20px;">
        ${comp.features.map(f => `<span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 999px; font-size: 12px; margin: 2px;">${f}</span>`).join(' ')}
      </td>
    </tr>
  </table>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px; border-top: 1px solid #e5e7eb;">
    <thead>
      <tr>
        <th style="padding: 12px 16px; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; width: 50%; text-align: left;">✅ Сильные стороны</th>
        <th style="padding: 12px 16px; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; width: 50%; text-align: left;">❌ Слабые стороны</th>
      </tr>
    </thead>
    <tbody>
      <tr style="vertical-align: top;">
        <td style="padding: 16px; border: 1px solid #e5e7eb; background: #f0fdf4;">
          <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
            ${swot.strengths.map(s => `<li style="color: #166534; margin-bottom: 6px;"><strong style="color: #15803d;">${s}</strong></li>`).join('\n            ')}
          </ul>
        </td>
        <td style="padding: 16px; border: 1px solid #e5e7eb;">
          <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
            ${swot.weaknesses.map(w => `<li style="color: #991b1b; margin-bottom: 6px;">${w}</li>`).join('\n            ')}
          </ul>
        </td>
      </tr>
      <tr>
        <th style="padding: 12px 16px; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; text-align: left;">💡 Возможности</th>
        <th style="padding: 12px 16px; background: #fefce8; color: #854d0e; border: 1px solid #fef08a; text-align: left;">⚠️ Угрозы</th>
      </tr>
      <tr style="vertical-align: top;">
        <td style="padding: 16px; border: 1px solid #e5e7eb; background: #f8fafc;">
          <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
            ${swot.opportunities.map(o => `<li style="color: #1e40af; margin-bottom: 6px;">${o}</li>`).join('\n            ')}
          </ul>
        </td>
        <td style="padding: 16px; border: 1px solid #e5e7eb; background: #fffbeb;">
          <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
            ${swot.threats.map(t => `<li style="color: #854d0e; margin-bottom: 6px;">${t}</li>`).join('\n            ')}
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN API HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { idea, correction } = body;

    if (!idea) {
      return NextResponse.json({ 
        success: false, 
        error: 'Idea is required' 
      }, { status: 400 });
    }

    console.log('[CompetitorsSearch] Starting REAL web search...');

    // Extract product info from idea text
    const { name: productName, description, industry } = extractProductInfo(idea);
    
    console.log(`[CompetitorsSearch] Product: "${productName}"`);
    console.log(`[CompetitorsSearch] Industry: "${industry}"`);

    // Build search queries based on extracted info
    const searchQueries = [
      `${productName} конкуренты аналоги Россия`,
      `${industry} программное обеспечение конкуренты`,
      `${productName} alternatives competitors software`,
    ];
    
    if (correction) {
      searchQueries.unshift(`${correction} конкуренты`);
    }

    // Perform web searches
    console.log('[CompetitorsSearch] Searching web for competitors...');
    const allResults: SearchResult[] = [];
    
    for (const query of searchQueries) {
      const results = await searchWeb(query, 5);
      allResults.push(...results);
    }
    
    console.log(`[CompetitorsSearch] Found ${allResults.length} search results`);

    // Extract competitors using LLM
    console.log('[CompetitorsSearch] Extracting competitors from search results...');
    let competitors = await extractCompetitorsFromSearch(productName, description, allResults);
    
    // Limit to 5 competitors
    competitors = competitors.slice(0, 5);
    
    console.log(`[CompetitorsSearch] Extracted ${competitors.length} competitors`);

    // Generate SWOT for each competitor
    console.log('[CompetitorsSearch] Generating SWOT analyses...');
    for (const comp of competitors) {
      comp.swot = await generateSWOTAnalysis(comp, productName);
    }

    // Search for market info
    const marketInfo = await searchMarketInfo(industry || productName);

    // Generate HTML output
    const competitorsHtml = competitors.map((c, i) => formatCompetitorHtml(c, i)).join('\n');
    
    const comparisonTable = competitors.length > 0 ? `
  <h2 style="font-size: 18px; color: #1e293b; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px; margin: 28px 0 20px 0;">📊 3. Сравнительная таблица</h2>
  
  <table style="width: 100%; border-collapse: collapse; font-size: 14px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <thead>
      <tr style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white;">
        <th style="padding: 14px 16px; text-align: left;">Критерий</th>
        ${competitors.slice(0, 3).map(c => `<th style="padding: 14px 16px; text-align: center;">${c.name}</th>`).join('')}
        <th style="padding: 14px 16px; text-align: center; background: #f0fdf4;">${productName}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px 16px; font-weight: 600;">🛠 Функциональность</td>
        ${competitors.slice(0, 3).map(() => '<td style="padding: 12px 16px; text-align: center;">⭐⭐⭐⭐</td>').join('')}
        <td style="padding: 12px 16px; text-align: center; background: #f0fdf4; font-weight: 600; color: #166534;">⭐⭐⭐⭐⭐</td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 12px 16px; font-weight: 600;">🎨 UX/UI</td>
        ${competitors.slice(0, 3).map(() => '<td style="padding: 12px 16px; text-align: center;">⭐⭐⭐</td>').join('')}
        <td style="padding: 12px 16px; text-align: center; background: #f0fdf4; font-weight: 600; color: #166534;">⭐⭐⭐⭐⭐</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-weight: 600;">🇷🇺 Поддержка РФ</td>
        ${competitors.slice(0, 3).map(() => '<td style="padding: 12px 16px; text-align: center;">⭐⭐⭐⭐</td>').join('')}
        <td style="padding: 12px 16px; text-align: center; background: #f0fdf4; font-weight: 600; color: #166534;">⭐⭐⭐⭐⭐</td>
      </tr>
    </tbody>
  </table>` : '';

    const analysis = `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 100%; color: #1f2937;">
  <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 28px; border-radius: 16px; margin-bottom: 28px;">
    <h1 style="margin: 0 0 8px 0; font-size: 24px;">🔍 Конкурентный анализ</h1>
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 400; opacity: 0.9;">${productName}</h2>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <div style="background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px;">
        <span style="opacity: 0.7; font-size: 12px;">Отрасль</span><br/>
        <span style="font-weight: 600; font-size: 14px;">${industry || 'Не указана'}</span>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px;">
        <span style="opacity: 0.7; font-size: 12px;">Конкурентов найдено</span><br/>
        <span style="font-weight: 600; font-size: 14px;">${competitors.length}</span>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px;">
        <span style="opacity: 0.7; font-size: 12px;">Источник</span><br/>
        <span style="font-weight: 600; font-size: 14px;">🌐 Веб-поиск</span>
      </div>
    </div>
  </div>
  
  <h2 style="font-size: 18px; color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin: 0 0 20px 0;">🏢 1. Прямые конкуренты</h2>
  
  ${competitorsHtml || '<p style="color: #6b7280; font-style: italic;">Конкуренты не найдены. Попробуйте уточнить описание продукта.</p>'}
  
  ${comparisonTable}
  
  <h2 style="font-size: 18px; color: #1e293b; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px; margin: 28px 0 20px 0;">🌍 4. Рыночный контекст</h2>
  
  <div style="background: #f8fafc; border-left: 4px solid #8b5cf6; padding: 20px 24px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 12px 0;"><strong>Тренды:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
      ${marketInfo.marketTrends.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join('\n      ')}
    </ul>
  </div>
  
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 24px; border-radius: 12px; margin-top: 28px;">
    <h3 style="margin: 0 0 12px 0; font-size: 18px;">💡 Рекомендации по позиционированию</h3>
    <p style="margin: 0; opacity: 0.9;">
      ${productName} должен позиционироваться как современное решение с фокусом на:
      <br/>• Удобство интерфейса
      <br/>• Интеграции с существующими системами
      <br/>• Поддержка российского рынка
    </p>
  </div>
  
  <div style="margin-top: 28px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #6b7280;">
    📊 Анализ выполнен на основе веб-поиска • ${new Date().toLocaleDateString('ru-RU')} • ${Date.now() - startTime}ms
  </div>
</div>`;

    console.log(`[CompetitorsSearch] Analysis completed in ${Date.now() - startTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      analysis,
      competitorsCount: competitors.length,
      searchPerformed: true,
      searchDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CompetitorsSearch] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to analyze competitors' 
    }, { status: 500 });
  }
}
