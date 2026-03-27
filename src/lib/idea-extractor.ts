// Idea Extractor v11.0 - NO TEMPLATES, ONLY TEXT EXTRACTION
// CRITICAL: Extract EVERYTHING from the transcript, never use predefined categories
// v11.0: Removed all industry databases and templates - pure text extraction

import { LLM } from './zai';

export interface ExtractedIdea {
  name: string;
  description: string;
  industry: string;
  industryContext: string;
  subIndustry: string;
  marketContext: string;
  functions: string[];
  useCases: string[];
  userTypes: string;
  valueProposition: string;
  risks: string[];
  difficulties: string[];
  hypotheses: { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[];
  userStories: { role: string; want: string; benefit: string; source: string; acceptanceCriteria: string[] }[];
  jtbd: { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[];
  functionalRequirements: { feature: string; description: string; priority: string; source: string; details: string[] }[];
  poInsights: { insight: string; recommendation: string; impact: string }[];
  mvpScope: { feature: string; reason: string; effort: string }[];
  extractionLog: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC PHRASES - Must be filtered out
// ═══════════════════════════════════════════════════════════════════════════

const GENERIC_PHRASES = new Set([
  'из контекста', 'из текста', 'конкретные', 'реальные', 'определённые',
  'функция 1', 'функция 2', 'функция 3', 'функция 4', 'функция 5',
  'эта идея', 'этой идеи', 'эту идею', 'этой идеей',
  'на основе анализа', 'на основе текста', 'из анализа',
  'ценность', 'value proposition', 'главное преимущество продукта',
  'функциональные требования', 'основные функции', 'ключевые функции',
  'риски реализации', 'трудности реализации', 'конкретные риски',
  'сценарии использования', 'конкретные сценарии',
  'продукт', 'сервис', 'приложение', 'система', 'платформа',
  'решение', 'проект', 'идея', 'бизнес', 'идеи',
]);

function isGenericPhrase(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (GENERIC_PHRASES.has(lower)) return true;
  
  // Check if text matches template patterns
  if (/^\d+\s*[-–—]\s*из контекста/i.test(text)) return true;
  if (/^\[\s*[^]]+\s*\]$/.test(text)) return true;
  if (/^функци[яи]\s*\d/i.test(text)) return true;
  if (/^ценност[ьы]/i.test(text) && lower.length < 30) return true;
  
  // Catch all forms of "это"
  if (/^эт[аоиыюяеёй]\w*\s+/i.test(text)) return true;
  
  // Catch "на основе анализа/текста/рынка"
  if (/на\s+основе\s+(анализа|текста|рынка|данных)/i.test(text)) return true;
  
  // Catch bracketed templates like "[из контекста]"
  if (/^\[.*\]$/.test(text)) return true;
  
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function cleanText(text: string): string {
  return text
    .replace(/^(—|–|-|:)+\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/\[.*?\]/g, '')
    .trim();
}

function isValidContent(text: string): boolean {
  if (!text || text.length < 3) return false;
  if (isGenericPhrase(text)) return false;
  
  const meaningfulWords = text.match(/[а-яё]{4,}/gi);
  if (!meaningfulWords || meaningfulWords.length < 1) return false;
  
  if (/^[а-яё]{1,3}\s/i.test(text)) return false;
  if (/\s[а-яё]{1,3}$/i.test(text)) return false;
  
  if (/^###?\s/.test(text)) return false;
  if (/\]$/.test(text) && text.includes('[')) return false;
  
  return true;
}

function deepCleanText(text: string): string {
  return text
    .replace(/###?\s*[^\n]*/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s*[-–—]\s*из\s*(текст|контекст|анализ)[а-яё]*/gi, '')
    .replace(/[,;:)\]]+\s*$/, '')
    .replace(/^[,;:(\[]+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTION FUNCTION - Uses LLM for intelligent extraction
// ═══════════════════════════════════════════════════════════════════════════

export async function extractIdeaWithLLM(sourceText: string): Promise<ExtractedIdea> {
  const log: string[] = [];
  log.push(`[v11.0] Начало интеллектуального анализа, длина: ${sourceText.length}`);
  
  const llm = new LLM();
  
  const systemPrompt = `Ты — эксперт по анализу продуктовых идей. Твоя задача — извлечь СТРУКТУРИРОВАННУЮ информацию из текста.

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
1. Извлекай ТОЛЬКО то, что ЕСТЬ в тексте
2. НЕ придумывай и НЕ добавляй ничего от себя
3. НЕ используй шаблоны или предопределённые категории
4. Если в тексте нет информации — оставь поле пустым или напиши "не указано"

Извлеки из текста:
- Название продукта (если есть, например из заголовка)
- Описание продукта (что это, для чего)
- Отрасль (ИЗ ТЕКСТА! Не подставляй шаблоны!)
- Подотрасль/ниша
- Целевую аудиторию
- Функции продукта (что он делает)
- Ценностное предложение
- Риски и трудности (из текста)

Ответь ТОЛЬКО валидным JSON без дополнительного текста.`;

  const userPrompt = `Проанализируй следующий текст и извлеки структурированную информацию о продукте/идее:

${sourceText.substring(0, 8000)}

Ответь в формате JSON:
{
  "name": "Название продукта из текста",
  "description": "Описание продукта из текста",
  "industry": "Отрасль ИЗ ТЕКСТА (не шаблон!)",
  "subIndustry": "Подотрасль/ниша из текста",
  "userTypes": "Целевая аудитория из текста",
  "functions": ["функция 1 из текста", "функция 2 из текста"],
  "valueProposition": "Ценностное предложение из текста",
  "useCases": ["сценарий 1 из текста"],
  "risks": ["риск 1 из текста"],
  "difficulties": ["трудность 1 из текста"],
  "marketContext": "Контекст рынка из текста"
}`;

  try {
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3
    });
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      log.push(`[LLM] Извлечено:`);
      log.push(`- Название: "${parsed.name}"`);
      log.push(`- Отрасль: "${parsed.industry}"`);
      log.push(`- Функций: ${parsed.functions?.length || 0}`);
      
      // Generate additional structured data
      const userStories = generateUserStoriesFromFunctions(parsed.functions || [], parsed.userTypes || '', sourceText);
      const functionalRequirements = generateRequirementsFromFunctions(parsed.functions || [], sourceText);
      const hypotheses = generateHypothesesFromData(parsed, sourceText);
      const jtbd = generateJTBDFromData(parsed, sourceText);
      const poInsights = generateInsightsFromData(parsed, sourceText);
      const mvpScope = generateMVPScopeFromFunctions(parsed.functions || [], sourceText);
      
      return {
        name: parsed.name || '',
        description: parsed.description || '',
        industry: parsed.industry || '',
        industryContext: parsed.marketContext || '',
        subIndustry: parsed.subIndustry || '',
        marketContext: parsed.marketContext || '',
        functions: parsed.functions || [],
        useCases: parsed.useCases || [],
        userTypes: parsed.userTypes || '',
        valueProposition: parsed.valueProposition || '',
        risks: parsed.risks || [],
        difficulties: parsed.difficulties || [],
        hypotheses,
        userStories,
        jtbd,
        functionalRequirements,
        poInsights,
        mvpScope,
        extractionLog: log,
      };
    }
  } catch (error) {
    log.push(`[LLM] Ошибка: ${error}`);
  }
  
  // Fallback - return empty but valid structure
  log.push(`[Fallback] Возвращаем пустую структуру`);
  return {
    name: '',
    description: '',
    industry: '',
    industryContext: '',
    subIndustry: '',
    marketContext: '',
    functions: [],
    useCases: [],
    userTypes: '',
    valueProposition: '',
    risks: [],
    difficulties: [],
    hypotheses: [],
    userStories: [],
    jtbd: [],
    functionalRequirements: [],
    poInsights: [],
    mvpScope: [],
    extractionLog: log,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNC VERSION FOR BACKWARD COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════

export function extractIdeaFromText(sourceText: string): ExtractedIdea {
  const log: string[] = [];
  log.push(`[v12.0-NO-TEMPLATES] Начало анализа, длина: ${sourceText.length}`);
  
  const fullText = sourceText.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  
  // Extract product name from first line (transcription header)
  const name = extractProductName(fullText, log);
  
  // Extract description from content
  const description = extractDescription(fullText, name, log);
  
  // Extract industry FROM TEXT (not from predefined database!)
  const { industry, subIndustry, marketContext } = extractIndustryFromText(fullText, log);
  
  // Extract functions from text
  const functions = extractFunctions(fullText, log);
  
  // Extract target audience from text
  const userTypes = extractTargetAudience(fullText, log);
  
  // Extract value proposition from text
  const valueProposition = extractValueProposition(fullText, log);
  
  // Extract risks and difficulties from text
  const risks = extractRisks(fullText, log);
  const difficulties = extractDifficulties(fullText, log);
  
  // Generate structured data
  const userStories = generateUserStoriesFromFunctions(functions, userTypes, fullText);
  const functionalRequirements = generateRequirementsFromFunctions(functions, fullText);
  const hypotheses = generateHypotheses({ name, industry, functions, userTypes, valueProposition }, log);
  const jtbd = generateJTBD(fullText, name, description, functions, log);
  const poInsights = generateInsights(industry, subIndustry, functions, userTypes, valueProposition, log);
  const mvpScope = defineMVPScope(functions, functionalRequirements, log);
  
  log.push(`[v11.0] Анализ завершён`);
  log.push(`- Название: "${name}"`);
  log.push(`- Отрасль: "${industry}" → "${subIndustry}"`);
  log.push(`- Функций: ${functions.length}`);
  
  return {
    name,
    description,
    industry,
    industryContext: marketContext,
    subIndustry,
    marketContext,
    functions,
    useCases: [],
    userTypes,
    valueProposition,
    risks,
    difficulties,
    hypotheses,
    userStories,
    jtbd,
    functionalRequirements,
    poInsights,
    mvpScope,
    extractionLog: log,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT NAME EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractProductName(fullText: string, log: string[]): string {
  log.push('[Name] Поиск названия...');
  
  const notProductName = new Set([
    'гугл таблицы', 'google таблицы', 'excel', 'таблицы', 'база данных',
    'приложение', 'система', 'платформа', 'сервис', 'продукт', 'проект',
    'лендинг', 'сайт', 'мобильное приложение', 'идеи', 'идея',
    'ios', 'android', 'web', 'веб-админка', 'продвижение', 'встреча',
  ]);
  
  const isProductName = (name: string): boolean => {
    if (!name || name.length < 2 || name.length > 40) return false;
    const lower = name.toLowerCase();
    if (notProductName.has(lower)) return false;
    if (isGenericPhrase(name)) return false;
    return true;
  };
  
  // Pattern 1: Transcription header "Транскрипция записи \"Название\""
  const firstLine = fullText.split('\n')[0] || '';
  const transcriptionMatch = firstLine.match(/транскрипци[а-яё]*\s+записи\s+["«']?([^"«»'\n]+)["»']?/i);
  if (transcriptionMatch && isProductName(transcriptionMatch[1])) {
    log.push(`[Name] Найдено в заголовке: "${transcriptionMatch[1]}"`);
    return transcriptionMatch[1].trim();
  }
  
  // Pattern 2: Brand with .ИИ / .AI suffix
  const aiBrandMatch = fullText.match(/([А-ЯЁA-Z][а-яёa-zA-Z]*(?:\.[ИИAИ][ИИAИ]?|[A-Z]{2}))/);
  if (aiBrandMatch && isProductName(aiBrandMatch[1])) {
    log.push(`[Name] Найден AI-бренд: "${aiBrandMatch[1]}"`);
    return aiBrandMatch[1].trim();
  }
  
  // Pattern 3: Quoted name
  const quotedMatches = fullText.matchAll(/[«"'"]([A-Za-z0-9ЁА-Яёа-я\s\-]{2,30})[»'""]/g);
  for (const match of quotedMatches) {
    const candidate = match[1].trim();
    if (isProductName(candidate)) {
      log.push(`[Name] Найдено в кавычках: "${candidate}"`);
      return candidate;
    }
  }
  
  log.push('[Name] Название не найдено');
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════
// INDUSTRY EXTRACTION FROM TEXT - NO TEMPLATES!
// ═══════════════════════════════════════════════════════════════════════════

function extractIndustryFromText(fullText: string, log: string[]): { industry: string; subIndustry: string; marketContext: string } {
  log.push('[Industry] Извлечение отрасли из текста...');
  
  // Look for explicit industry mentions
  const industryPatterns = [
    // "отрасль X", "сфера X", "рынок X"
    /(?:отрасль|сфера|рынок|ниша|сегмент)[а-яё]*\s*[—–:]?\s*([а-яёa-z\s]{3,40})/gi,
    // "в сфере X", "на рынке X"
    /в\s+(?:отрасли|сфере|рынке|нише)\s+([а-яёa-z\s]{3,40})/gi,
    // "продукт для X", "решение для X"
    /(?:продукт|решение|сервис|платформа)\s+для\s+([а-яёa-z\s]{3,40})/gi,
  ];
  
  const industries: string[] = [];
  
  for (const pattern of industryPatterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const industry = cleanText(match[1]);
      if (isValidContent(industry) && industry.length > 3) {
        industries.push(industry);
      }
    }
  }
  
  if (industries.length > 0) {
    // Take the most specific one
    const uniqueIndustries = [...new Set(industries.map(i => i.toLowerCase()))];
    const mainIndustry = industries[0];
    log.push(`[Industry] Найдено: "${mainIndustry}"`);
    
    // Try to extract sub-industry
    const subIndustryPattern = /(?:подотрасль|подсегмент|сегмент|ниша)[а-яё]*\s*[—–:]?\s*([а-яёa-z\s]{3,40})/gi;
    const subMatch = fullText.match(subIndustryPattern);
    const subIndustry = subMatch ? cleanText(subMatch[1]) : '';
    
    // Try to extract market context
    const marketPattern = /(?:тренд|рост|рынок|объём)[а-яё]*\s*[—–:]?\s*([а-яёa-z\s\d%]{10,100})/gi;
    const marketMatch = fullText.match(marketPattern);
    const marketContext = marketMatch ? cleanText(marketMatch[1]) : '';
    
    return { industry: mainIndustry, subIndustry, marketContext };
  }
  
  // Try to infer from product context
  const contextWords: string[] = [];
  
  // Look for key domain words in the text
  const domainPatterns = [
    /\b(телефон|звонок|атс|crm|сиэрэм|виджет|дашборд|контакт|оператор|абонент)\w*\b/gi,
    /\b(фитнес|тренер|зал|тренировка|абонемент|спорт)\w*\b/gi,
    /\b(магазин|товар|доставка|заказ|корзина|продаж)\w*\b/gi,
    /\b(образовани[ею]|обучени[ею]|курс|урок|студент)\w*\b/gi,
    /\b(медицин[а-яё]|врач|пациент|клиник[аи])\w*\b/gi,
    /\b(финанс|платёж|банк|кредит|страх)\w*\b/gi,
    /\b(логистик|склад|груз|перевозк|доставк)\w*\b/gi,
    /\b(недвижим|квартир|аренд|риэлтор)\w*\b/gi,
  ];
  
  for (const pattern of domainPatterns) {
    const matches = fullText.match(pattern);
    if (matches && matches.length >= 3) {
      // Found domain keywords
      const domain = matches[0].toLowerCase();
      contextWords.push(domain);
    }
  }
  
  if (contextWords.length > 0) {
    const inferredIndustry = `Сфера: ${contextWords[0]}`;
    log.push(`[Industry] Выведено из контекста: "${inferredIndustry}"`);
    return { industry: inferredIndustry, subIndustry: '', marketContext: '' };
  }
  
  log.push('[Industry] Отрасль не найдена в тексте');
  return { industry: '', subIndustry: '', marketContext: '' };
}

// ═══════════════════════════════════════════════════════════════════════════
// DESCRIPTION EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractDescription(fullText: string, name: string, log: string[]): string {
  log.push('[Description] Поиск описания продукта...');
  
  const descriptionPatterns = [
    /(?:задача|проект|идея|суть|продукт|сервис)[а-яё]*\s*[—–:]?\s*([^\n]{30,250})/i,
    /(?:мы\s+)?(?:созда[ёю]м|разрабатываем|делаем|строим|запускаем)\s+([^\n]{30,250})/i,
    /(?:хотим|планируем|будем)\s+([^\n]{30,200})/i,
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = fullText.match(pattern);
    if (match && isValidContent(match[1] || match[0])) {
      log.push('[Description] Найдено по паттерну');
      return deepCleanText(match[1] || match[0]);
    }
  }
  
  log.push('[Description] Описание не найдено');
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCTIONS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractFunctions(fullText: string, log: string[]): string[] {
  log.push('[Functions] Извлечение функций...');
  const functions: string[] = [];
  const seen = new Set<string>();
  
  const isFunctionValid = (text: string): boolean => {
    if (!isValidContent(text)) return false;
    if (/^\d+\s*[-–—]/.test(text)) return false;
    if (/из\s*(контекст|текст|анализ)/i.test(text)) return false;
    return true;
  };
  
  // Pattern 1: "нужен/нужна/нужно X"
  const needMatches = fullText.matchAll(/(?:нужен|нужна|нужно|необходим)[а-яё]*\s+([а-яёa-z0-9\s\-]{5,50})/gi);
  for (const match of needMatches) {
    let func = cleanText(match[1]);
    func = func.replace(/^(чтобы|что|как|был[аои]?)\s+/i, '').trim();
    if (isFunctionValid(func) && !seen.has(func.toLowerCase().substring(0, 20))) {
      seen.add(func.toLowerCase().substring(0, 20));
      functions.push(func.charAt(0).toUpperCase() + func.slice(1));
    }
  }
  
  // Pattern 2: "функция X", "модуль X"
  const moduleMatches = fullText.matchAll(/(?:модуль|система|функци[яи]|раздел|блок|виджет)\s+([а-яёa-z0-9\s\-]{5,45})/gi);
  for (const match of moduleMatches) {
    const func = cleanText(match[1]);
    if (isFunctionValid(func) && !seen.has(func.toLowerCase().substring(0, 20))) {
      seen.add(func.toLowerCase().substring(0, 20));
      functions.push(func.charAt(0).toUpperCase() + func.slice(1));
    }
  }
  
  log.push(`[Functions] Найдено ${functions.length} функций`);
  return functions.slice(0, 8);
}

// ═══════════════════════════════════════════════════════════════════════════
// TARGET AUDIENCE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractTargetAudience(fullText: string, log: string[]): string {
  log.push('[Audience] Поиск целевой аудитории...');
  
  const audiences: string[] = [];
  
  // Look for role nouns
  const rolePatterns = [
    /(?<![а-яё])(клиент[а-яё]*|пользовател[а-яё]*|заказчик[а-яё]*|покупател[а-яё]*|руководител[а-яё]*|менеджер[а-яё]*|администратор[а-яё]*|сотрудник[а-яё]*)(?![а-яё])/gi,
  ];
  
  for (const pattern of rolePatterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const role = match[1].trim();
      if (!audiences.some(a => a.includes(role.substring(0, 10)))) {
        audiences.push(role);
      }
    }
  }
  
  // Look for "для X" mentions
  const forMatches = fullText.matchAll(/для\s+([а-яёa-z\s]{5,45})(?:\s|,|\.|;)/gi);
  for (const match of forMatches) {
    const audience = match[1].trim();
    if (isValidContent(audience) && !audiences.some(a => a.includes(audience.substring(0, 15)))) {
      audiences.push(audience);
    }
  }
  
  if (audiences.length > 0) {
    const unique = [...new Set(audiences.map(a => a.toLowerCase()))];
    log.push(`[Audience] Найдено ${unique.length} сегментов`);
    return audiences.slice(0, 4).join('\n');
  }
  
  log.push('[Audience] Аудитория не найдена');
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════
// VALUE PROPOSITION EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractValueProposition(fullText: string, log: string[]): string {
  log.push('[Value] Поиск ценностного предложения...');
  
  const patterns = [
    /(?:ставка на|сделаем ставку на|упор на)\s+([^.]{10,100})/i,
    /(?:в отличие от|лучше|быстрее|удобнее|проще)\s+[^.]{10,120}/i,
    /(?:преимущество|фишка|особенность|отличие|главное)[а-яё]*\s*[—–:]?\s*([^.]{15,150})/i,
  ];
  
  for (const pattern of patterns) {
    const match = fullText.match(pattern);
    if (match && isValidContent(match[1] || match[0])) {
      log.push('[Value] Найдено ценностное предложение');
      return deepCleanText(match[1] || match[0]);
    }
  }
  
  log.push('[Value] Ценность не найдена');
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════
// RISKS & DIFFICULTIES EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractRisks(fullText: string, log: string[]): string[] {
  log.push('[Risks] Поиск рисков...');
  const risks: string[] = [];
  
  const riskPatterns = [
    /(?:риск|проблема|угроза|опас)[а-яё]*\s*[—–:]?\s*([а-яёa-z\s]{10,80})/gi,
    /может\s+(?:не\s+)?(?:получиться|случиться|произойти)\s+([а-яёa-z\s]{10,60})/gi,
  ];
  
  for (const pattern of riskPatterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const risk = cleanText(match[1]);
      if (isValidContent(risk) && !risks.some(r => r.includes(risk.substring(0, 15)))) {
        risks.push(risk);
      }
    }
  }
  
  log.push(`[Risks] Найдено ${risks.length} рисков`);
  return risks.slice(0, 5);
}

function extractDifficulties(fullText: string, log: string[]): string[] {
  log.push('[Difficulties] Поиск трудностей...');
  const difficulties: string[] = [];
  
  const diffPatterns = [
    /(?:трудност[а-яё]*|сложност[а-яё]*|препятстви[а-яё]*|барьер)[а-яё]*\s*[—–:]?\s*([а-яёa-z\s]{10,80})/gi,
    /(?:сложно|трудно|проблематичн)\s+([а-яёa-z\s]{10,60})/gi,
  ];
  
  for (const pattern of diffPatterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const diff = cleanText(match[1]);
      if (isValidContent(diff) && !difficulties.some(d => d.includes(diff.substring(0, 15)))) {
        difficulties.push(diff);
      }
    }
  }
  
  log.push(`[Difficulties] Найдено ${difficulties.length} трудностей`);
  return difficulties.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE STRUCTURED DATA
// ═══════════════════════════════════════════════════════════════════════════

function generateUserStoriesFromFunctions(functions: string[], userTypes: string, sourceText: string): { role: string; want: string; benefit: string; source: string; acceptanceCriteria: string[] }[] {
  const role = userTypes.split('\n')[0]?.trim() || 'Пользователь';
  
  return functions.slice(0, 6).map(func => {
    const sourceMatch = sourceText.match(new RegExp(`.{0,40}${func}.{0,40}`, 'i'));
    return {
      role,
      want: func,
      benefit: 'решить свою задачу',
      source: sourceMatch ? `💬 "${sourceMatch[0].trim()}"` : '',
      acceptanceCriteria: [],
    };
  });
}

function generateRequirementsFromFunctions(functions: string[], sourceText: string): { feature: string; description: string; priority: string; source: string; details: string[] }[] {
  return functions.map((func, i) => {
    const sourceMatch = sourceText.match(new RegExp(`.{0,30}${func}.{0,30}`, 'i'));
    return {
      feature: func,
      description: `Функциональное требование`,
      priority: i < 3 ? 'Must Have' : 'Should Have',
      source: sourceMatch ? `💬 "${sourceMatch[0].trim()}"` : `📋 "${func}"`,
      details: [],
    };
  });
}

function generateHypotheses(data: { name: string; industry: string; functions: string[]; userTypes: string; valueProposition: string }, log: string[]): { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[] {
  log.push('[Hypotheses] Генерация гипотез...');
  
  const hypotheses: { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[] = [];
  
  if (data.valueProposition) {
    hypotheses.push({
      hypothesis: `Ценностное предложение "${data.valueProposition.substring(0, 50)}..." резонирует с аудиторией`,
      type: 'Ценность',
      validation: 'Custdev интервью, A/B тест landing page',
      priority: 'High',
      rationale: 'Ключевое отличие от конкурентов',
    });
  }
  
  if (data.functions.length > 0) {
    hypotheses.push({
      hypothesis: `Функция "${data.functions[0]}" критична для пользователей`,
      type: 'Решение',
      validation: 'MVP тест, метрики использования',
      priority: 'High',
      rationale: 'Основная функциональность продукта',
    });
  }
  
  hypotheses.push({
    hypothesis: `Целевая аудитория "${data.userTypes.substring(0, 30)}..." готова платить за решение`,
    type: 'Рынок',
    validation: 'WTP-опросы, анализ конкурентов',
    priority: 'High',
    rationale: 'Валидация платежеспособного спроса',
  });
  
  return hypotheses;
}

function generateJTBD(fullText: string, name: string, description: string, functions: string[], log: string[]): { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[] {
  log.push('[JTBD] Генерация Jobs To Be Done...');
  
  // Look for JTBD patterns in text
  const jtbd: { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[] = [];
  
  const whenMatches = fullText.matchAll(/когда\s+([а-яёa-z\s]{10,60}),?\s+(?:я\s+)?(?:хочу|нужно|надо)\s+([а-яёa-z\s]{10,60})/gi);
  for (const match of whenMatches) {
    jtbd.push({
      situation: match[1],
      motivation: match[2],
      outcome: '',
      source: `💬 "${match[0]}"`,
      emotionalContext: '',
    });
  }
  
  return jtbd.slice(0, 3);
}

function generateInsights(industry: string, subIndustry: string, functions: string[], userTypes: string, valueProposition: string, log: string[]): { insight: string; recommendation: string; impact: string }[] {
  log.push('[Insights] Генерация инсайтов...');
  
  const insights: { insight: string; recommendation: string; impact: string }[] = [];
  
  if (functions.length > 0) {
    insights.push({
      insight: 'MVP должен включать минимальный набор критичных функций',
      recommendation: `Scope MVP: ${functions.slice(0, 3).join(', ')}`,
      impact: 'Сокращение time-to-market',
    });
  }
  
  if (industry) {
    insights.push({
      insight: `Ниша "${industry}" имеет специфику`,
      recommendation: 'Учесть отраслевые особенности в дизайне',
      impact: 'Увеличение конверсии',
    });
  }
  
  return insights;
}

function defineMVPScope(functions: string[], requirements: { feature: string; description: string; priority: string; source: string; details: string[] }[], log: string[]): { feature: string; reason: string; effort: string }[] {
  log.push('[MVP] Определение MVP scope...');
  
  return functions.slice(0, 5).map((func, i) => ({
    feature: func,
    reason: i < 3 ? 'Основная функциональность' : 'Дополнительная ценность',
    effort: i < 2 ? 'Low' : 'Medium',
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT AS MARKDOWN
// ═══════════════════════════════════════════════════════════════════════════

export function formatIdeaAsMarkdown(idea: ExtractedIdea): string {
  const md = `# 💡 ИДЕЯ ПРОДУКТА

═══════════════════════════════════════════════════════════════
## 🎯 Название

${idea.name || 'Не указано'}

📝 Описание

${idea.description || 'Не указано'}

🏢 Отрасль

${idea.industry || 'Не указана'}${idea.subIndustry ? ` → ${idea.subIndustry}` : ''}

${idea.marketContext ? `\n${idea.marketContext}` : ''}

═══════════════════════════════════════════════════════════════
👥 Целевая аудитория

${idea.userTypes || 'Не указана'}

⚡ Ключевая ценность

${idea.valueProposition || 'Не указана'}

🛠️ Основные функции

${idea.functions.map(f => `- ${f}`).join('\n') || 'Не указаны'}

═══════════════════════════════════════════════════════════════
📋 Функциональные требования

${idea.functionalRequirements.map((fr, i) => `FR-${i + 1}: ${fr.feature}

Приоритет: ${fr.priority}
${fr.source ? `💬 ${fr.source}` : ''}`).join('\n\n') || 'Не указаны'}

═══════════════════════════════════════════════════════════════
📖 User Stories

${idea.userStories.map((us, i) => `US-${i + 1}

Как ${us.role}, я хочу ${us.want}, чтобы ${us.benefit}.
${us.source ? us.source : ''}`).join('\n\n') || 'Не указаны'}

═══════════════════════════════════════════════════════════════
🧪 Гипотезы для валидации

${idea.hypotheses.map((h, i) => `H-${i + 1}: ${h.type}

Гипотеза: ${h.hypothesis}
Валидация: ${h.validation}
Приоритет: ${h.priority}`).join('\n\n') || 'Не указаны'}

═══════════════════════════════════════════════════════════════
🎯 MVP Scope

${idea.mvpScope.map(s => `- ${s.feature} (${s.effort}) — ${s.reason}`).join('\n') || 'Не определён'}

═══════════════════════════════════════════════════════════════
⚠️ Риски

${idea.risks.map(r => `- ${r}`).join('\n') || 'Не указаны'}

🔧 Трудности

${idea.difficulties.map(d => `- ${d}`).join('\n') || 'Не указаны'}

💡 Рекомендации

${idea.poInsights.map((ins, i) => `💡 Insight ${i + 1}

Наблюдение: ${ins.insight}
Рекомендация: ${ins.recommendation}
Влияние: ${ins.impact}`).join('\n\n') || 'Не указаны'}

═══════════════════════════════════════════════════════════════

Извлечено Product Owner Agent v11.0
Все данные извлечены из предоставленного текста
`;

  return md;
}
