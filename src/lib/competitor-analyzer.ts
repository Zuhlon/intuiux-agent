// Competitor Analyzer v2.0 - NO TEMPLATES, CONTEXT-AWARE ANALYSIS
// CRITICAL: Analyze competitors based on EXTRACTED data, never use predefined databases

import { ExtractedIdea } from './idea-extractor';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface CompetitorAnalysisResult {
  productName: string;
  industryName: string;
  marketSize: string;
  marketTrends: string[];
  directCompetitors: {
    name: string;
    url: string;
    country: string;
    description: string;
    features: string[];
    pricing: string;
    targetAudience: string;
    swotHtml: string;
    scores: {
      functionality: number;
      price: number;
      ux: number;
      support: number;
    };
  }[];
  indirectCompetitors: {
    name: string;
    description: string;
    approach: string;
    overlap: string;
    differentiation: string;
  }[];
  comparisonTable: string;
  differentiationOpportunities: string[];
  positioningRecommendation: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SWOT ANALYSIS - Generate from context
// ═══════════════════════════════════════════════════════════════════════════

function generateSWOTTable(
  strengths: string[],
  weaknesses: string[],
  opportunities: string[],
  threats: string[]
): string {
  return `
| 💪 Сильные стороны | 📉 Слабые стороны |
|---|---|
| ${strengths.map(s => `✓ ${s}`).join('<br>')} | ${weaknesses.map(w => `✗ ${w}`).join('<br>')} |

| 🚀 Возможности | ⚠️ Угрозы |
|---|---|
| ${opportunities.map(o => `→ ${o}`).join('<br>')} | ${threats.map(t => `⚠ ${t}`).join('<br>')} |
`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION - Creates analysis from extracted data
// ═══════════════════════════════════════════════════════════════════════════

export function analyzeCompetitors(idea: ExtractedIdea): CompetitorAnalysisResult {
  // Generate competitors based on industry context
  // NOTE: This is a fallback for when web search is not available
  // In production, use the web-search based competitors-search API
  
  const directCompetitors = generateCompetitorsFromContext(idea);
  const indirectCompetitors = generateIndirectCompetitorsFromContext(idea);
  const comparisonTable = generateComparisonTable(idea, directCompetitors);
  const differentiationOpportunities = generateDifferentiationFromContext(idea);
  const positioningRecommendation = generatePositioningFromContext(idea);
  
  return {
    productName: idea.name,
    industryName: idea.industry || 'Не указана',
    marketSize: idea.marketContext || 'Данные не указаны',
    marketTrends: [],
    directCompetitors,
    indirectCompetitors,
    comparisonTable,
    differentiationOpportunities,
    positioningRecommendation,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE COMPETITORS FROM CONTEXT (Fallback only)
// ═══════════════════════════════════════════════════════════════════════════

function generateCompetitorsFromContext(idea: ExtractedIdea): CompetitorAnalysisResult['directCompetitors'] {
  // Create placeholder competitors based on extracted industry
  // These should be replaced by REAL web search results
  return [
    {
      name: 'Конкурент 1 (поиск)',
      url: '#',
      country: 'Россия',
      description: 'Требуется веб-поиск для определения реальных конкурентов',
      features: idea.functions.slice(0, 3),
      pricing: 'Не определено',
      targetAudience: idea.userTypes,
      swotHtml: generateSWOTTable(
        ['Требуется анализ'],
        ['Требуется анализ'],
        ['Требуется анализ'],
        ['Требуется анализ']
      ),
      scores: { functionality: 3, price: 3, ux: 3, support: 3 },
    },
  ];
}

function generateIndirectCompetitorsFromContext(idea: ExtractedIdea): CompetitorAnalysisResult['indirectCompetitors'] {
  return [
    {
      name: 'Косвенный конкурент (поиск)',
      description: 'Требуется веб-поиск для определения',
      approach: 'Не определено',
      overlap: 'Не определено',
      differentiation: 'Не определено',
    },
  ];
}

function generateComparisonTable(idea: ExtractedIdea, competitors: CompetitorAnalysisResult['directCompetitors']): string {
  const compNames = competitors.map(c => c.name).join(' | ');
  return `
| Критерий | ${compNames} | ${idea.name} |
|---|---|---|
| Функциональность | ${competitors.map(() => '⭐⭐⭐').join(' | ')} | ⭐⭐⭐⭐ |
| Цена | ${competitors.map(() => '⭐⭐⭐').join(' | ')} | ⭐⭐⭐⭐ |
| UX/UI | ${competitors.map(() => '⭐⭐⭐').join(' | ')} | ⭐⭐⭐⭐⭐ |
`;
}

function generateDifferentiationFromContext(idea: ExtractedIdea): string[] {
  const opportunities: string[] = [];
  
  // Based on extracted functions
  if (idea.functions.length > 0) {
    opportunities.push(`**${idea.functions[0]}** — ключевая функция продукта`);
  }
  
  if (idea.valueProposition) {
    opportunities.push(`**${idea.valueProposition}** — уникальное преимущество`);
  }
  
  opportunities.push('**Простота интерфейса** — фокус на UX');
  opportunities.push('**Российский рынок** — локализация и поддержка');
  
  return opportunities.slice(0, 5);
}

function generatePositioningFromContext(idea: ExtractedIdea): string {
  let recommendation = `${idea.name} должен позиционироваться как решение для "${idea.industry || 'целевой аудитории'}"`;
  
  if (idea.functions.length > 0) {
    recommendation += ` с ключевыми функциями: ${idea.functions.slice(0, 3).join(', ')}`;
  }
  
  if (idea.valueProposition) {
    recommendation += `. Главное преимущество: ${idea.valueProposition}`;
  }
  
  return recommendation;
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT AS MARKDOWN
// ═══════════════════════════════════════════════════════════════════════════

export function formatCompetitorAnalysisAsMarkdown(result: CompetitorAnalysisResult): string {
  const md = `## 🔍 Конкурентный анализ для "${result.productName}"

### 📊 Тип продукта: ${result.industryName}

---

## 1. ПРЯМЫЕ КОНКУРЕНТЫ

${result.directCompetitors.map((c, i) => `### ${i + 1}. ${c.name} ${c.country ? `(${c.country})` : ''}

> **Сайт:** ${c.url}  
> **Описание:** ${c.description}  
> **Основные функции:** ${c.features.join(', ')}  
> **Ценовая модель:** ${c.pricing}  
> **Целевая аудитория:** ${c.targetAudience}

#### SWOT-анализ

${c.swotHtml}`).join('\n\n---\n\n')}

---

## 2. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ

${result.differentiationOpportunities.map((d, i) => `${i + 1}. ${d}`).join('\n')}

---

## 3. РЕКОМЕНДАЦИИ ПО ПОЗИЦИОНИРОВАНИЮ

${result.positioningRecommendation}

---

*Анализ выполнен на основе извлечённых данных. Для более точного анализа используйте веб-поиск.*
`;

  return md;
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT AS HTML
// ═══════════════════════════════════════════════════════════════════════════

export function formatCompetitorAnalysisAsHTML(result: CompetitorAnalysisResult): string {
  return `
<div class="competitor-analysis">
  <style>
    .competitor-analysis { font-family: 'Inter', -apple-system, sans-serif; }
    .competitor-analysis h2 { color: #1a1a2e; font-size: 1.75rem; margin-bottom: 1rem; }
    .competitor-analysis h3 { color: #16213e; font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
  </style>

  <h2>🔍 Конкурентный анализ для "${result.productName}"</h2>
  
  <div class="product-type">📊 ${result.industryName}</div>
  
  <hr/>
  
  <h3>1. ПРЯМЫЕ КОНКУРЕНТЫ</h3>
  
  ${result.directCompetitors.map((c, i) => `
  <div class="competitor-card">
    <div class="competitor-header">
      <div class="competitor-number">${i + 1}</div>
      <div>
        <div class="competitor-name">${c.name}</div>
        <div class="competitor-country">${c.country}</div>
      </div>
    </div>
    
    <p><strong>Описание:</strong> ${c.description}</p>
    <p><strong>Функции:</strong> ${c.features.join(', ')}</p>
  </div>
  `).join('')}
  
  <h3>2. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ</h3>
  
  ${result.differentiationOpportunities.map(d => `
  <div class="opportunity-item">${d}</div>
  `).join('')}
  
  <div class="positioning-box">
    <h3>3. РЕКОМЕНДАЦИИ ПО ПОЗИЦИОНИРОВАНИЮ</h3>
    <p>${result.positioningRecommendation}</p>
  </div>
</div>
`;
}
