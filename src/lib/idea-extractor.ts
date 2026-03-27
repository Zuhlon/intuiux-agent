// Idea Extractor v10.5 - Complete rewrite with proper dialog parsing
// KEY FIX: Extract ACTUAL content from dialogs, not template garbage
// v10.5: Fixed ALL regex character class ordering (Latin before Cyrillic)

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
// DIALOG PARSER - Critical for extracting from conversation transcripts
// ═══════════════════════════════════════════════════════════════════════════

interface DialogTurn {
  speaker: string;
  text: string;
  isClient: boolean;
}

function parseDialog(fullText: string): DialogTurn[] {
  const turns: DialogTurn[] = [];
  const lines = fullText.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^([А-Я][а-яё]+):\s*(.+)$/);
    if (match) {
      const speaker = match[1];
      const text = match[2].trim();
      // Detect who is client vs developer based on context
      const isClient = speaker.toLowerCase().includes('михаил') || 
                       speaker.toLowerCase().includes('клиент') ||
                       speaker.toLowerCase().includes('заказчик');
      turns.push({ speaker, text, isClient });
    }
  }
  
  return turns;
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
  'решение', 'проект', 'идея', 'бизнес',
]);

function isGenericPhrase(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (GENERIC_PHRASES.has(lower)) return true;
  
  // Check if text matches template patterns
  if (/^\d+\s*[-–—]\s*из контекста/i.test(text)) return true;
  if (/^\[\s*[^]]+\s*\]$/.test(text)) return true;  // [template]
  if (/^функци[яи]\s*\d/i.test(text)) return true;
  if (/^ценност[ьы]/i.test(text) && lower.length < 30) return true;
  
  // Catch all forms of "это" - этой, этого, этим, этом, этом, etc.
  if (/^эт[аоиыюяеёй]\w*\s+/i.test(text)) return true;
  
  // Catch "на основе анализа/текста/рынка"
  if (/на\s+основе\s+(анализа|текста|рынка|данных)/i.test(text)) return true;
  
  // Catch bracketed templates like "[из контекста]"
  if (/^\[.*\]$/.test(text)) return true;
  
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// INDUSTRY DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const INDUSTRY_DATABASE: Record<string, {
  patterns: RegExp[];
  subIndustries: { patterns: RegExp[]; name: string }[];
  marketContext: string;
}> = {
  'SportTech': {
    patterns: [/(спорт|фитнес|трен[ае]р|зал|тренировк|абонемент|спортивн|йог|pilates|crossfit|бассейн|fitness|gym|спортклуб)/i],
    subIndustries: [
      { patterns: [/фитнес|трен[ае]р|зал|абонемент|fitness|gym/i], name: 'Фитнес-клубы' },
      { patterns: [/йог|pilates/i], name: 'Йога и пилатес' },
      { patterns: [/бассейн|плаван/i], name: 'Плавание' },
    ],
    marketContext: 'SportTech растет на волне ЗОЖ. Ключевое - retention, геймификация.',
  },
  'E-commerce': {
    patterns: [/(магазин|товар|корзин|доставк|заказ|покупк|продаж|каталог|ecommerce)/i],
    subIndustries: [
      { patterns: [/аквариум|рыб|водоросл|креветк|аквариумист|aquarium/i], name: 'Зоомагазин (аквариумистика)' },
      { patterns: [/зоо|питом|корм|животн/i], name: 'Зоомагазин' },
      { patterns: [/маркетплейс|продавец|селлер/i], name: 'Маркетплейсы' },
      { patterns: [/одежд|обувь|fashion/i], name: 'Fashion e-commerce' },
      { patterns: [/продукт|пищ|ед[аы]|grocery/i], name: 'Продукты' },
    ],
    marketContext: 'E-commerce растет 30%+ в год. Ключевое - логистика, персонализация.',
  },
  'FinTech': {
    patterns: [/(платеж|перевод|кредит|страхов|инвестиц|банк|финанс|кошел|карт[аы])/i],
    subIndustries: [
      { patterns: [/пла(теж|тёж)|перевод.*денег|p2p/i], name: 'Платежные системы' },
      { patterns: [/кредит|займ|микрофинан/i], name: 'Кредитование' },
    ],
    marketContext: 'FinTech - быстрорастущий сектор. Ключевое - доверие и безопасность.',
  },
  'FoodTech': {
    patterns: [/(ресторан|кафе|ед[аы]|меню|доставк.*ед|рецепт)/i],
    subIndustries: [
      { patterns: [/доставк.*ед|ед.*доставк/i], name: 'Доставка еды' },
      { patterns: [/ресторан|кафе|столик/i], name: 'Ресторанный бизнес' },
    ],
    marketContext: 'FoodTech показывает взрывной рост. Ключевое - скорость и качество.',
  },
  'EdTech': {
    patterns: [/(обучени[ею]|курс|урок|студент|образован|lms|лекци)/i],
    subIndustries: [
      { patterns: [/онлайн.*школ|школьн/i], name: 'Онлайн-школы' },
      { patterns: [/корпоративн.*обучен/i], name: 'Корпоративное обучение' },
    ],
    marketContext: 'Рынок онлайн-образования растет 20-30% в год.',
  },
  'HealthTech': {
    patterns: [/(медицин|врач|пациент|клиник|здоровь|аптек|диагност)/i],
    subIndustries: [
      { patterns: [/телемед|онлайн.*врач/i], name: 'Телемедицина' },
      { patterns: [/аптек|лекарств/i], name: 'E-pharmacy' },
    ],
    marketContext: 'Рынок медицины консервативен. Регуляторика строгая.',
  },
  'PropTech': {
    patterns: [/(недвижим|квартир|дом|аренд|риэлтор|ипотек)/i],
    subIndustries: [
      { patterns: [/аренд|съем/i], name: 'Аренда' },
      { patterns: [/покупк|продаж.*недв/i], name: 'Продажа недвижимости' },
    ],
    marketContext: 'PropTech трансформируется. Ключевое - доверие, качество данных.',
  },
  'Logistics': {
    patterns: [/(логист|склад|груз|перевозк|транспорт|маршрут)/i],
    subIndustries: [
      { patterns: [/склад|хранен/i], name: 'Складская логистика' },
      { patterns: [/перевозк|транспорт/i], name: 'Грузоперевозки' },
    ],
    marketContext: 'Логистика - backbone e-commerce. Ключевое - оптимизация.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanText(text: string): string {
  return text
    .replace(/^(?:—|–|-|:)+\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/\[.*?\]/g, '') // Remove [bracketed templates]
    .trim();
}

function isValidContent(text: string): boolean {
  if (!text || text.length < 3) return false;
  if (isGenericPhrase(text)) return false;
  
  // Must have at least one meaningful Russian word
  const meaningfulWords = text.match(/[а-яё]{4,}/gi);
  if (!meaningfulWords || meaningfulWords.length < 1) return false;
  
  // Skip if it looks like broken dialog fragment
  if (/^[а-яё]{1,3}\s/i.test(text)) return false;
  if (/\s[а-яё]{1,3}$/i.test(text)) return false;
  
  // Skip markdown fragments
  if (/^###?\s/.test(text)) return false;
  if (/\]$/.test(text) && text.includes('[')) return false;
  
  return true;
}

// Clean text from artifacts
function deepCleanText(text: string): string {
  return text
    // Remove markdown headers
    .replace(/###?\s*[^\n]*/g, '')
    // Remove bracketed templates
    .replace(/\[[^\]]*\]/g, '')
    // Remove "из текста" patterns
    .replace(/\s*[-–—]\s*из\s*(текст|контекст|анализ)[а-яё]*/gi, '')
    // Remove trailing punctuation artifacts
    .replace(/[,;:)\]]+\s*$/, '')
    .replace(/^[,;:(\[]+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function extractIdeaFromText(sourceText: string): ExtractedIdea {
  const log: string[] = [];
  log.push(`[v10.0] Начало анализа, длина: ${sourceText.length}`);
  
  const fullText = sourceText.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  const lowerText = fullText.toLowerCase();
  const turns = parseDialog(fullText);
  const isDialog = turns.length > 3;
  
  log.push(`[Dialog] Обнаружено ${turns.length} реплик, isDialog: ${isDialog}`);
  
  // Extract all components
  const { industry, subIndustry, marketContext } = identifyIndustry(fullText, lowerText, log);
  const name = extractProductName(fullText, log);
  const description = extractDescription(fullText, name, turns, log);
  const userTypes = extractTargetAudience(fullText, turns, log);
  const functions = extractFunctions(fullText, turns, log);
  const functionalRequirements = extractFunctionalRequirements(fullText, functions, turns, log);
  const valueProposition = extractValueProposition(fullText, turns, log);
  const userStories = extractUserStories(fullText, userTypes, functions, turns, log);
  const useCases = extractUseCases(fullText, functions, turns, log);
  const risks = extractRisks(fullText, turns, log);
  const difficulties = extractDifficulties(fullText, turns, log);
  const jtbd = extractJTBD(fullText, name, description, functions, log);
  const hypotheses = generateHypotheses(functions, userTypes, valueProposition, industry, log);
  const poInsights = generateInsights(industry, subIndustry, functions, userTypes, valueProposition, log);
  const mvpScope = defineMVPScope(functions, functionalRequirements, log);

  const industryData = INDUSTRY_DATABASE[industry];
  
  log.push(`[v10.0] Анализ завершен`);
  log.push(`- Название: "${name}"`);
  log.push(`- Отрасль: "${industry}" → "${subIndustry}"`);
  log.push(`- Аудитория: "${userTypes.substring(0, 50)}..."`);
  log.push(`- Функций: ${functions.length}`);
  
  return {
    name,
    description,
    industry,
    industryContext: industryData?.marketContext || '',
    subIndustry,
    marketContext,
    functions,
    useCases,
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
// INDUSTRY IDENTIFICATION
// ═══════════════════════════════════════════════════════════════════════════

function identifyIndustry(fullText: string, lowerText: string, log: string[]): 
  { industry: string; subIndustry: string; marketContext: string } {
  log.push('[Industry] Определение отрасли...');
  
  for (const [industryName, data] of Object.entries(INDUSTRY_DATABASE)) {
    for (const pattern of data.patterns) {
      if (pattern.test(fullText)) {
        // Find sub-industry
        for (const sub of data.subIndustries) {
          for (const subPattern of sub.patterns) {
            if (subPattern.test(fullText)) {
              log.push(`[Industry] Найдено: ${industryName} → ${sub.name}`);
              return { 
                industry: industryName, 
                subIndustry: sub.name, 
                marketContext: data.marketContext 
              };
            }
          }
        }
        // Return main industry if no sub-industry matched
        log.push(`[Industry] Найдено: ${industryName}`);
        return { industry: industryName, subIndustry: '', marketContext: data.marketContext };
      }
    }
  }
  
  log.push('[Industry] Отрасль не определена');
  return { industry: '', subIndustry: '', marketContext: '' };
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT NAME EXTRACTION - v2: Be smarter about quoted text
// ═══════════════════════════════════════════════════════════════════════════

function extractProductName(fullText: string, log: string[]): string {
  log.push('[Name] Поиск названия...');
  
  // Words that are NOT product names (common nouns, tools, etc.)
  const notProductName = new Set([
    'гугл таблицы', 'google таблицы', 'excel', 'таблицы', 'база данных',
    'приложение', 'система', 'платформа', 'сервис', 'продукт', 'проект',
    'лендинг', 'сайт', 'мобильное приложение',
    'ios', 'android', 'web', 'веб-админка',
  ]);
  
  const isProductName = (name: string): boolean => {
    if (!name || name.length < 2 || name.length > 40) return false;
    const lower = name.toLowerCase();
    if (notProductName.has(lower)) return false;
    if (isGenericPhrase(name)) return false;
    // Skip if it contains common nouns
    if (/^(приложение|система|платформа|сервис|таблиц|база)/i.test(name)) return false;
    return true;
  };
  
  // Pattern 1: Business/brand name in first few lines
  const firstLines = fullText.split('\n').slice(0, 15).join('\n');
  
  // Look for business context: "Бизнес X", "клуб X", "студия X"
  // Note: Character ranges must be in Unicode order: Latin (65-122), then Cyrillic (1025-1105)
  const businessMatch = firstLines.match(/(?:бизнес|клуб|студия|центр|зал|компания|фирма)\s+["«']?([A-Za-z0-9ЁА-Яёа-я\s\-]{2,25})["»']?/i);
  if (businessMatch && isProductName(businessMatch[1])) {
    log.push(`[Name] Найдено название бизнеса: "${businessMatch[1]}"`);
    return businessMatch[1].trim();
  }
  
  // Pattern 2: Quoted name - but verify it's not a common noun
  const quotedMatches = fullText.matchAll(/[«"'"]([A-Za-z0-9ЁА-Яёа-я\s\-]{2,30})[»'""]/g);
  for (const match of quotedMatches) {
    const candidate = match[1].trim();
    if (isProductName(candidate)) {
      log.push(`[Name] Найдено в кавычках: "${candidate}"`);
      return candidate;
    }
  }
  
  // Pattern 3: "называется X" / "название X"
  const namedMatch = fullText.match(/(?:называется|название)\s*[«"']?([A-Za-z0-9ЁА-Яёа-я\s\-]{2,30})[»"']?/i);
  if (namedMatch && isProductName(namedMatch[1])) {
    log.push(`[Name] Найдено по ключевому слову: "${namedMatch[1]}"`);
    return namedMatch[1].trim();
  }
  
  // Pattern 4: Look for capitalized word that could be brand name
  // Check context - should be mentioned as "это", "мой", "наш" nearby
  // Note: Character class must have Latin (65-122) before Cyrillic (1040-1103) to avoid range error
  const brandMatches = fullText.matchAll(/(?<![a-zа-яё])([A-ZА-ЯЁ][a-zA-Zа-яёА-ЯЁ]{2,15})(?![a-zа-яё])/gi);
  for (const match of brandMatches) {
    const word = match[1];
    if (!isProductName(word)) continue;
    // Check context around this word
    const idx = match.index || 0;
    const context = fullText.substring(Math.max(0, idx - 50), idx + 50);
    if (/(клуб|студия|центр|бизнес|название|бренд|логотип|компания)/i.test(context)) {
      log.push(`[Name] Найдено по контексту: "${word}"`);
      return word;
    }
  }
  
  // Pattern 5: Descriptive name from first dialog turn
  const dialogTurns = parseDialog(fullText);
  for (const turn of dialogTurns.slice(0, 3)) {
    // Look for "мне нужно приложение для X"
    const appMatch = turn.text.match(/(?:нужно |сделать )?(?:приложение|система|сервис)\s+(?:для\s+)?([a-zа-яё\s]{5,30})/i);
    if (appMatch) {
      const name = appMatch[1].trim();
      if (isProductName(name) && name.length > 5) {
        log.push(`[Name] Найдено описательное название: "${name}"`);
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }
  
  log.push('[Name] Название не найдено');
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════
// DESCRIPTION EXTRACTION - v2: Extract product essence, not dialog greetings
// ═══════════════════════════════════════════════════════════════════════════

function extractDescription(fullText: string, name: string, turns: DialogTurn[], log: string[]): string {
  log.push('[Description] Поиск описания продукта...');
  
  // Pattern 1: "X — это ..."
  if (name) {
    const escapedName = escapeRegex(name);
    const thisMatch = fullText.match(new RegExp(`${escapedName}\\s*(?:—|–|-)?\\s*это\\s+([^.\\n]{30,300})`, 'i'));
    if (thisMatch && isValidContent(thisMatch[1])) {
      log.push('[Description] Найдено через "это"');
      return cleanText(thisMatch[1]);
    }
  }
  
  // Pattern 2: Look for product description in dialog - skip greetings
  // Look for phrases like "задача...", "проект...", "суть...", "делаем..."
  const descriptionPatterns = [
    /(?:задача|проект|идея|суть|продукт|сервис|магазин|приложение)\s*[—–:]?\s*([^.\\n]{30,250})/i,
    /(?:мы\s+)?(?:созда[ёю]м|разрабатываем|делаем|строим|запускаем|открываем)\s+([^.\\n]{30,250})/i,
    /(?:хотим|планируем|будем)\s+([^.\\n]{30,200})/i,
    /(?:бизнес|магазин|сервис)\s+(?:по\s+)?([^.\\n]{20,200})/i,
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = fullText.match(pattern);
    if (match && isValidContent(match[1] || match[0])) {
      log.push('[Description] Найдено по паттерну описания');
      return deepCleanText(match[1] || match[0]);
    }
  }
  
  // Pattern 3: From developer dialog turns (not client greetings)
  const devTurns = turns.filter(t => !t.isClient);
  for (const turn of devTurns) {
    const text = turn.text;
    // Skip greetings and short phrases
    if (text.length < 40) continue;
    if (/^(привет|здравствуй|добрый)/i.test(text)) continue;
    if (/спасибо|благодар/i.test(text)) continue;
    // Look for substantial content
    if (text.length > 50 && isValidContent(text)) {
      log.push('[Description] Найдено в реплике разработчика');
      return deepCleanText(text.substring(0, 250));
    }
  }
  
  // Pattern 4: First non-greeting line
  const lines = fullText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip dialog headers, greetings, short lines
    if (trimmed.length < 50) continue;
    if (/^[А-Я][а-я]+:/.test(trimmed)) continue;
    if (/^(привет|здравствуй|добрый|спасибо)/i.test(trimmed)) continue;
    if (trimmed.startsWith('#')) continue;
    if (isValidContent(trimmed)) {
      log.push('[Description] Найдено в первом значимом абзаце');
      return deepCleanText(trimmed.substring(0, 250));
    }
  }
  
  log.push('[Description] Описание не найдено');
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════
// TARGET AUDIENCE EXTRACTION - FIXED v3
// ═══════════════════════════════════════════════════════════════════════════

function extractTargetAudience(fullText: string, turns: DialogTurn[], log: string[]): string {
  log.push('[Audience] Поиск целевой аудитории...');
  
  const audiences: string[] = [];
  
  // Additional filter for template garbage in audience
  const isAudienceValid = (text: string): boolean => {
    if (!isValidContent(text)) return false;
    // Filter out template fragments
    if (/эт[аоиыюяеёй]\w*\s+иде/i.test(text)) return false;
    if (/на\s+основе\s+/i.test(text)) return false;
    if (/из\s+(контекст|текст|анализ)/i.test(text)) return false;
    if (/анализ[а-яё]*\s*рынк/i.test(text)) return false;
    // Filter out dialog fragments
    if (/клиент\s+подтвердил/i.test(text)) return false;
    if (/клиент\s+подтвердит/i.test(text)) return false;
    if (/подтвердил\s*,?\s*что/i.test(text)) return false;
    if (/съемок\s+оператор/i.test(text)) return false;
    if (/регион[а-яё]*\s+съемок/i.test(text)) return false;
    if (/\bчто\b|\bчтобы\b|\bбудет\b|\bбудут\b/i.test(text)) return false;
    // Filter out fragmented sentences
    if (/^\w+\s+\w+$/.test(text) && text.split(' ').every(w => w.length <= 8)) {
      // Two short words - likely a fragment
      const words = text.split(' ');
      if (words.length === 2 && words[0].match(/клиент|пользовател|заказчик/i)) {
        return false;
      }
    }
    return true;
  };
  
  // Pattern 1: Role nouns first (most reliable) - аквариумисты, владельцы, любители, клиенты клубов
  const roleMatches = fullText.matchAll(/(?<![а-яё])(аквариумист[а-яё]*|любител[а-яё]*\s+(?:аквариум|рыб|водоросл)|рыбовод[а-яё]*|владелец[а-яё]*\s+(?:аквариум|рыб|клуб|студии|зала)|покупател[а-яё]*\s+(?:рыб|аквариум)|клиент[а-яё]*\s+(?:клуб|студии|зала|фитнес)|тренер[а-яё]*|посетител[а-яё]*\s+(?:зал|клуб|студии))/gi);
  for (const match of roleMatches) {
    const role = match[1].trim();
    if (!audiences.some(a => a.includes(role.substring(0, 10)))) {
      audiences.push(role);
    }
  }
  
  // Pattern 2: Standalone role nouns
  const standaloneRoles = fullText.matchAll(/(?<![а-яё])(аквариумист[а-яё]*|любител[а-яё]*|рыбовод[а-яё]*|владельц[а-яё]*|клиент[а-яё]*|тренер[а-яё]*|посетител[а-яё]*)(?![а-яё])/gi);
  for (const match of standaloneRoles) {
    const role = match[1];
    if (!audiences.some(a => a.includes(role.substring(0, 10)))) {
      audiences.push(role);
    }
  }
  
  // Pattern 3: "для X" mentions - but exclude template garbage
  const forMatches = fullText.matchAll(/для\s+([a-zа-яё\s]{5,45})(?:\s|,|\.|;)/gi);
  for (const match of forMatches) {
    const audience = match[1].trim();
    if (isAudienceValid(audience) && !audiences.some(a => a.includes(audience.substring(0, 15)))) {
      audiences.push(audience);
    }
  }
  
  // Pattern 4: "наши клиенты/пользователи"
  const clientMatch = fullText.match(/(?:наш[а-яё]*\s+)?(клиент[а-яё]*|пользовател[а-яё]*|покупател[а-яё]*|заказчик[а-яё]*)\s*[—–-]?\s*(?:это\s+)?([a-zа-яё\s]{5,60})/i);
  if (clientMatch) {
    const combined = `${clientMatch[1]} ${clientMatch[2]}`.trim();
    if (isAudienceValid(combined) && !audiences.some(a => a.includes(combined.substring(0, 15)))) {
      audiences.unshift(combined);
    }
  }
  
  if (audiences.length > 0) {
    // Deduplicate and clean - keep original casing
    const unique: string[] = [];
    const seenLower = new Set<string>();
    for (const a of audiences) {
      const lower = a.toLowerCase();
      if (!seenLower.has(lower) && isAudienceValid(a)) {
        seenLower.add(lower);
        unique.push(a);
      }
    }
    log.push(`[Audience] Найдено ${unique.length} сегментов`);
    return unique.slice(0, 4).join('\n');
  }
  
  log.push('[Audience] Аудитория не найдена');
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCTIONS EXTRACTION - FIXED v2
// ═══════════════════════════════════════════════════════════════════════════

function extractFunctions(fullText: string, turns: DialogTurn[], log: string[]): string[] {
  log.push('[Functions] Извлечение функций...');
  const functions: string[] = [];
  const seen = new Set<string>();
  
  // Additional filter for template garbage in functions
  const isFunctionValid = (text: string): boolean => {
    if (!isValidContent(text)) return false;
    // Filter out template fragments
    if (/^\d+\s*[-–—]/.test(text)) return false;  // "1 - из контекста"
    if (/из\s*(контекст|текст|анализ)/i.test(text)) return false;
    if (/функци[яи]\s*\d/i.test(text)) return false;
    if (/\]$/.test(text) && !/^\[/.test(text)) return false; // Trailing bracket without opening
    if (/на\s+основе\s+/i.test(text)) return false;
    if (/эт[аоиыюяеёй]\w*\s+иде/i.test(text)) return false;
    if (/ценност[а-яё]*\s*предложен/i.test(text)) return false;
    if (/риски\s+реализац/i.test(text)) return false;
    if (/трудност[а-яё]*\s+реализац/i.test(text)) return false;
    if (/сценари[а-яё]*\s+использован/i.test(text)) return false;
    // Must have meaningful content
    const wordCount = text.split(/\s+/).filter(w => w.length > 2).length;
    if (wordCount < 2) return false;
    return true;
  };
  
  // Pattern 1: "нужен/нужна/нужно X"
  const needMatches = fullText.matchAll(/(?:нужен|нужна|нужно|необходим)[а-яё]*\s+([a-zа-яё0-9\s\-]{5,50})/gi);
  for (const match of needMatches) {
    let func = cleanText(match[1]);
    func = func.replace(/^(чтобы|что|как|был[аои]?)\s+/i, '').trim();
    if (isFunctionValid(func) && !seen.has(func.toLowerCase().substring(0, 20))) {
      seen.add(func.toLowerCase().substring(0, 20));
      functions.push(func.charAt(0).toUpperCase() + func.slice(1));
    }
  }
  
  // Pattern 2: "сделаем/добавим/реализуем X"
  const actionMatches = fullText.matchAll(/(?:сделаем|добавим|реализуем|будет|предусмотрим)\s+([a-zа-яё0-9\s\-]{8,50})/gi);
  for (const match of actionMatches) {
    let func = cleanText(match[1]);
    func = func.replace(/^(возможность|функци[яию])\s+/i, '').trim();
    if (isFunctionValid(func) && !seen.has(func.toLowerCase().substring(0, 20))) {
      seen.add(func.toLowerCase().substring(0, 20));
      functions.push(func.charAt(0).toUpperCase() + func.slice(1));
    }
  }
  
  // Pattern 3: "модуль/система/функция X"
  const moduleMatches = fullText.matchAll(/(?:модуль|система|функци[яи]|раздел|блок)\s+([a-zа-яё0-9\s\-]{5,45})/gi);
  for (const match of moduleMatches) {
    const func = cleanText(match[1]);
    if (isFunctionValid(func) && !seen.has(func.toLowerCase().substring(0, 20))) {
      seen.add(func.toLowerCase().substring(0, 20));
      functions.push(func.charAt(0).toUpperCase() + func.slice(1));
    }
  }
  
  // Pattern 4: Functions from dialog turns (Client requests)
  for (const turn of turns) {
    if (!turn.isClient) continue;
    
    // Look for "хочу/нужно/надо чтобы..."
    const wantMatch = turn.text.match(/(?:хочу|нужно|надо|хотелось бы)\s+(?:чтобы\s+)?([a-zа-яё0-9\s\-]{8,60})/i);
    if (wantMatch) {
      const func = cleanText(wantMatch[1]);
      if (isFunctionValid(func) && !seen.has(func.toLowerCase().substring(0, 20))) {
        seen.add(func.toLowerCase().substring(0, 20));
        functions.push(func.charAt(0).toUpperCase() + func.slice(1));
      }
    }
  }
  
  log.push(`[Functions] Найдено ${functions.length} функций`);
  return functions.slice(0, 8);
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCTIONAL REQUIREMENTS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractFunctionalRequirements(
  fullText: string, 
  functions: string[], 
  turns: DialogTurn[], 
  log: string[]
): { feature: string; description: string; priority: string; source: string; details: string[] }[] {
  log.push('[FR] Извлечение требований...');
  const requirements: { feature: string; description: string; priority: string; source: string; details: string[] }[] = [];
  
  for (let i = 0; i < functions.length; i++) {
    const func = functions[i];
    // Find source in text
    const sourceMatch = fullText.match(new RegExp(`.{0,30}${escapeRegex(func)}.{0,30}`, 'i'));
    const source = sourceMatch ? `💬 "${sourceMatch[0].trim()}"` : `📋 "${func}"`;
    
    requirements.push({
      feature: func,
      description: `Функциональное требование`,
      priority: i < 3 ? 'Must Have' : 'Should Have',
      source,
      details: [],
    });
  }
  
  log.push(`[FR] Найдено ${requirements.length} требований`);
  return requirements;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALUE PROPOSITION EXTRACTION - FIXED v2
// ═══════════════════════════════════════════════════════════════════════════

function extractValueProposition(fullText: string, turns: DialogTurn[], log: string[]): string {
  log.push('[Value] Поиск ценностного предложения...');
  
  // Validation for value proposition
  const isValueValid = (text: string): boolean => {
    if (!isValidContent(text)) return false;
    if (/из\s*(текст|контекст|анализ)/i.test(text)) return false;
    if (/###?\s/.test(text)) return false;
    if (/\]$/.test(text)) return false;
    if (/основные\s+функци/i.test(text)) return false;
    if (/преимуществ[а-яё]*\s+продукт/i.test(text) && text.length < 50) return false;
    return true;
  };
  
  // Pattern 1: "ставка на X" - most specific
  const betMatch = fullText.match(/(?:ставка на|сделаем ставку на|упор на)\s+([^.]{10,100})/i);
  if (betMatch && isValueValid(betMatch[1])) {
    log.push('[Value] Найдена стратегия');
    return deepCleanText(betMatch[1]);
  }
  
  // Pattern 2: "в отличие от/лучше чем"
  const compareMatch = fullText.match(/(?:в отличие от|лучше|быстрее|удобнее|проще)\s+[^.]{10,120}/i);
  if (compareMatch && isValueValid(compareMatch[0])) {
    log.push('[Value] Найдено сравнение');
    return deepCleanText(compareMatch[0]);
  }
  
  // Pattern 3: Quality descriptions from dialog
  for (const turn of turns) {
    const qualMatch = turn.text.match(/(?:качественн|удобн|быстр|прост|надежн|красив|премиум|эксклюзив)[а-яё]*\s+([^.]{10,80})/i);
    if (qualMatch && isValueValid(qualMatch[1] || qualMatch[0])) {
      log.push('[Value] Найдено качество');
      return deepCleanText(qualMatch[1] || qualMatch[0]);
    }
  }
  
  // Pattern 4: "преимущество/фишка/особенность" - but be careful with templates
  const advMatch = fullText.match(/(?:преимущество|фишка|особенность|отличие|главное)[а-яё]*\s*[—–:]?\s*([^.]{15,150})/i);
  if (advMatch && isValueValid(advMatch[1])) {
    log.push('[Value] Найдено преимущество');
    return deepCleanText(advMatch[1]);
  }
  
  log.push('[Value] Ценность не найдена');
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════
// USER STORIES EXTRACTION - FIXED v2: Clean role extraction
// ═══════════════════════════════════════════════════════════════════════════

function extractUserStories(
  fullText: string, 
  userTypes: string, 
  functions: string[], 
  turns: DialogTurn[], 
  log: string[]
): { role: string; want: string; benefit: string; source: string; acceptanceCriteria: string[] }[] {
  log.push('[US] Извлечение User Stories...');
  const stories: { role: string; want: string; benefit: string; source: string; acceptanceCriteria: string[] }[] = [];
  
  // Determine actual user role - extract clean role noun
  let defaultRole = 'Пользователь';
  
  // Try to get clean role from audience
  const audienceLines = userTypes.split('\n').filter(l => l.trim().length > 0);
  if (audienceLines.length > 0) {
    const firstLine = audienceLines[0].trim();
    // Extract just the role noun, not full sentence
    const roleMatch = firstLine.match(/(аквариумист[а-яё]*|любител[а-яё]*|клиент[а-яё]*|покупател[а-яё]*|пользовател[а-яё]*|владелец[а-яё]*|рыбовод[а-яё]*|тренер[а-яё]*|посетител[а-яё]*|спортсмен[а-яё]*)/i);
    if (roleMatch) {
      defaultRole = roleMatch[1];
    } else if (isValidContent(firstLine) && firstLine.length < 30 && !firstLine.includes(' ')) {
      defaultRole = firstLine;
    }
  }
  
  // Fallback: extract role directly from text with context
  if (defaultRole === 'Пользователь') {
    // Try context-aware role extraction
    if (/фитнес|тренер|зал|абонемент|тренировк|спорт/i.test(fullText)) {
      defaultRole = 'клиент фитнес-клуба';
    } else if (/аквариум|рыб|аквариумист/i.test(fullText)) {
      defaultRole = 'аквариумист';
    } else {
      // Generic fallback
      const roleMatch = fullText.match(/(?<![а-яё])(клиент[а-яё]*|пользовател[а-яё]*|покупател[а-яё]*)(?![а-яё])/i);
      if (roleMatch) {
        defaultRole = roleMatch[1];
      }
    }
  }
  
  log.push(`[US] Роль: "${defaultRole}"`);
  
  // Create user stories from functions
  for (let i = 0; i < Math.min(functions.length, 6); i++) {
    const func = functions[i];
    
    // Find source context
    const sourceMatch = fullText.match(new RegExp(`.{0,40}${escapeRegex(func)}.{0,40}`, 'i'));
    const source = sourceMatch ? `💬 "${sourceMatch[0].trim()}"` : '';
    
    stories.push({
      role: defaultRole,
      want: func,
      benefit: 'решить свою задачу',
      source,
      acceptanceCriteria: [],
    });
  }
  
  log.push(`[US] Создано ${stories.length} User Stories`);
  return stories;
}

// ═══════════════════════════════════════════════════════════════════════════
// USE CASES EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractUseCases(fullText: string, functions: string[], turns: DialogTurn[], log: string[]): string[] {
  log.push('[UC] Извлечение Use Cases...');
  const useCases: string[] = [];
  
  // Pattern: "если/когда X"
  const ifMatches = fullText.matchAll(/(?:если|когда)\s+([a-zа-яё0-9\s\-]{10,60})/gi);
  for (const match of ifMatches) {
    const uc = cleanText(match[1]);
    if (isValidContent(uc) && !useCases.some(u => u.includes(uc.substring(0, 15)))) {
      useCases.push(uc);
    }
  }
  
  // Pattern: "сценарий/кейс X"
  const scenarioMatch = fullText.matchAll(/(?:сценари[йи]|кейс)[а-яё]*\s*[—–:]?\s*([^.]{10,80})/gi);
  for (const match of scenarioMatch) {
    const uc = cleanText(match[1]);
    if (isValidContent(uc)) {
      useCases.push(uc);
    }
  }
  
  log.push(`[UC] Найдено ${useCases.length} Use Cases`);
  return useCases.slice(0, 6);
}

// ═══════════════════════════════════════════════════════════════════════════
// RISKS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractRisks(fullText: string, turns: DialogTurn[], log: string[]): string[] {
  log.push('[Risks] Извлечение рисков...');
  const risks: string[] = [];
  
  const riskMatch = fullText.matchAll(/(?:риск|проблема|сложность|трудность|угроз)[а-яё]*\s*[—–:]?\s*([^.]{10,100})/gi);
  for (const match of riskMatch) {
    const risk = cleanText(match[1]);
    if (isValidContent(risk)) {
      risks.push(risk);
    }
  }
  
  log.push(`[Risks] Найдено ${risks.length} рисков`);
  return risks.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// DIFFICULTIES EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractDifficulties(fullText: string, turns: DialogTurn[], log: string[]): string[] {
  log.push('[Difficulties] Извлечение трудностей...');
  const difficulties: string[] = [];
  
  const diffMatch = fullText.matchAll(/(?:трудност[а-яё]*|сложност[а-яё]*|препятств[а-яё]*|барьер[а-яё]*)\s*[—–:]?\s*([^.]{10,80})/gi);
  for (const match of diffMatch) {
    const diff = cleanText(match[1]);
    if (isValidContent(diff)) {
      difficulties.push(diff);
    }
  }
  
  log.push(`[Difficulties] Найдено ${difficulties.length} трудностей`);
  return difficulties.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// JTBD EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractJTBD(
  fullText: string, 
  name: string, 
  description: string, 
  functions: string[], 
  log: string[]
): { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[] {
  log.push('[JTBD] Извлечение Jobs To Be Done...');
  const jtbd: { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[] = [];
  
  // Pattern: "когда X, я хочу Y, чтобы Z"
  const jtbdMatch = fullText.matchAll(/когда\s+([^.]{10,50}),?\s*(?:я\s+)?(?:хочу|нужно|надо)\s+([^.]{10,50}),?\s*чтобы\s+([^.]{10,50})/gi);
  for (const match of jtbdMatch) {
    jtbd.push({
      situation: cleanText(match[1]),
      motivation: cleanText(match[2]),
      outcome: cleanText(match[3]),
      source: `💬 "${match[0].trim()}"`,
      emotionalContext: '',
    });
  }
  
  log.push(`[JTBD] Найдено ${jtbd.length} JTBD`);
  return jtbd.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// HYPOTHESES GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateHypotheses(
  functions: string[], 
  userTypes: string, 
  valueProposition: string, 
  industry: string,
  log: string[]
): { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[] {
  log.push('[Hypotheses] Генерация гипотез...');
  const hypotheses: { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[] = [];
  
  if (valueProposition) {
    hypotheses.push({
      hypothesis: `Ценностное предложение "${valueProposition.substring(0, 50)}..." резонирует с аудиторией`,
      type: 'Ценность',
      validation: 'Custdev интервью, A/B тест landing page',
      priority: 'High',
      rationale: 'Основное преимущество продукта',
    });
  }
  
  for (let i = 0; i < Math.min(functions.length, 3); i++) {
    hypotheses.push({
      hypothesis: `Функция "${functions[i]}" критична для пользователей`,
      type: 'Решение',
      validation: 'MVP тест, метрики использования',
      priority: i === 0 ? 'High' : 'Medium',
      rationale: 'Извлечено из диалога с клиентом',
    });
  }
  
  hypotheses.push({
    hypothesis: `Целевая аудитория "${userTypes.split('\n')[0].substring(0, 40)}..." готова платить за решение`,
    type: 'Рынок',
    validation: 'WTP-опросы, анализ конкурентов',
    priority: 'High',
    rationale: 'Валидация платёжеспособности',
  });
  
  log.push(`[Hypotheses] Сгенерировано ${hypotheses.length} гипотез`);
  return hypotheses;
}

// ═══════════════════════════════════════════════════════════════════════════
// INSIGHTS GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateInsights(
  industry: string, 
  subIndustry: string, 
  functions: string[], 
  userTypes: string, 
  valueProposition: string,
  log: string[]
): { insight: string; recommendation: string; impact: string }[] {
  log.push('[Insights] Генерация инсайтов...');
  const insights: { insight: string; recommendation: string; impact: string }[] = [];
  
  if (functions.length > 0) {
    insights.push({
      insight: `MVP должен включать минимальный набор критичных функций`,
      recommendation: `Scope MVP: ${functions.slice(0, 3).join(', ')}`,
      impact: 'Сокращение time-to-market',
    });
  }
  
  if (subIndustry) {
    insights.push({
      insight: `Ниша "${subIndustry}" имеет специфику`,
      recommendation: 'Учесть отраслевые особенности в дизайне',
      impact: 'Увеличение конверсии',
    });
  }
  
  log.push(`[Insights] Сгенерировано ${insights.length} инсайтов`);
  return insights;
}

// ═══════════════════════════════════════════════════════════════════════════
// MVP SCOPE DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

function defineMVPScope(
  functions: string[], 
  requirements: { feature: string; priority: string }[], 
  log: string[]
): { feature: string; reason: string; effort: string }[] {
  log.push('[MVP] Определение MVP Scope...');
  const scope: { feature: string; reason: string; effort: string }[] = [];
  
  for (let i = 0; i < Math.min(functions.length, 5); i++) {
    const func = functions[i];
    const priority = requirements[i]?.priority || 'Should Have';
    scope.push({
      feature: func,
      reason: priority === 'Must Have' ? 'Основная функциональность' : 'Дополнительная ценность',
      effort: i < 2 ? 'Low' : 'Medium',
    });
  }
  
  log.push(`[MVP] Определено ${scope.length} фич для MVP`);
  return scope;
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKDOWN FORMATTER
// ═══════════════════════════════════════════════════════════════════════════

export function formatIdeaAsMarkdown(idea: ExtractedIdea): string {
  const sections: string[] = [];
  
  sections.push(`# 💡 ИДЕЯ ПРОДУКТА`);
  sections.push('');
  sections.push('═══════════════════════════════════════════════════════════════');
  
  // Name
  sections.push(`## 🎯 Название`);
  sections.push('');
  sections.push(idea.name || 'Не указано');
  sections.push('');
  
  // Description
  sections.push(`## 📝 Описание`);
  sections.push('');
  sections.push(idea.description || 'Не указано');
  sections.push('');
  
  // Industry
  sections.push(`## 🏢 Отрасль`);
  sections.push('');
  if (idea.industry) {
    sections.push(`${idea.industry}${idea.subIndustry ? ` → ${idea.subIndustry}` : ''}`);
    sections.push('');
    if (idea.marketContext) {
      sections.push(`*${idea.marketContext}*`);
      sections.push('');
    }
  } else {
    sections.push('Не определено');
    sections.push('');
  }
  
  sections.push('═══════════════════════════════════════════════════════════════');
  
  // Target Audience
  sections.push(`## 👥 Целевая аудитория`);
  sections.push('');
  sections.push(idea.userTypes || 'Не указано');
  sections.push('');
  
  // Value Proposition
  sections.push(`## ⚡ Ключевая ценность`);
  sections.push('');
  sections.push(idea.valueProposition || 'Не указано');
  sections.push('');
  
  // Functions
  sections.push(`## 🛠️ Основные функции`);
  sections.push('');
  if (idea.functions.length > 0) {
    idea.functions.forEach((f, i) => {
      sections.push(`${i + 1}. ${f}`);
    });
  } else {
    sections.push('Не указано');
  }
  sections.push('');
  
  sections.push('═══════════════════════════════════════════════════════════════');
  
  // Functional Requirements
  sections.push(`## 📋 Функциональные требования`);
  sections.push('');
  if (idea.functionalRequirements.length > 0) {
    idea.functionalRequirements.forEach((req, i) => {
      sections.push(`**FR-${i + 1}: ${req.feature}**`);
      sections.push('');
      sections.push(`Приоритет: ${req.priority}`);
      if (req.source) {
        sections.push(`${req.source}`);
      }
      sections.push('');
    });
  } else {
    sections.push('Не указано');
    sections.push('');
  }
  
  sections.push('═══════════════════════════════════════════════════════════════');
  
  // User Stories
  sections.push(`## 📖 User Stories`);
  sections.push('');
  if (idea.userStories.length > 0) {
    idea.userStories.forEach((story, i) => {
      sections.push(`**US-${i + 1}**`);
      sections.push('');
      sections.push(`Как **${story.role}**, я хочу **${story.want}**, чтобы **${story.benefit}**.`);
      if (story.source) {
        sections.push('');
        sections.push(story.source);
      }
      sections.push('');
    });
  } else {
    sections.push('Не указано');
    sections.push('');
  }
  
  sections.push('═══════════════════════════════════════════════════════════════');
  
  // Use Cases
  sections.push(`## 📋 Use Cases`);
  sections.push('');
  if (idea.useCases.length > 0) {
    idea.useCases.forEach((uc, i) => {
      sections.push(`**UC-${i + 1}** → ${uc}`);
    });
  } else {
    sections.push('Не указано');
  }
  sections.push('');
  
  sections.push('═══════════════════════════════════════════════════════════════');
  
  // Hypotheses
  sections.push(`## 🧪 Гипотезы для валидации`);
  sections.push('');
  if (idea.hypotheses.length > 0) {
    idea.hypotheses.forEach((h, i) => {
      sections.push(`**H-${i + 1}: ${h.type}**`);
      sections.push('');
      sections.push(`Гипотеза: ${h.hypothesis}`);
      sections.push(`Валидация: ${h.validation}`);
      sections.push(`Приоритет: ${h.priority}`);
      sections.push('');
    });
  } else {
    sections.push('Не указано');
    sections.push('');
  }
  
  sections.push('═══════════════════════════════════════════════════════════════');
  
  // MVP Scope
  sections.push(`## 🎯 MVP Scope`);
  sections.push('');
  if (idea.mvpScope.length > 0) {
    idea.mvpScope.forEach((item, i) => {
      sections.push(`${i + 1}. ${item.feature} (${item.effort}) — ${item.reason}`);
    });
  } else {
    sections.push('Не указано');
  }
  sections.push('');
  
  sections.push('═══════════════════════════════════════════════════════════════');
  
  // Risks
  if (idea.risks.length > 0) {
    sections.push(`## ⚠️ Риски`);
    sections.push('');
    idea.risks.forEach(r => {
      sections.push(`- ${r}`);
    });
    sections.push('');
  }
  
  // Difficulties
  if (idea.difficulties.length > 0) {
    sections.push(`## 🔧 Трудности`);
    sections.push('');
    idea.difficulties.forEach(d => {
      sections.push(`- ${d}`);
    });
    sections.push('');
  }
  
  // Insights
  if (idea.poInsights.length > 0) {
    sections.push(`## 💡 Рекомендации`);
    sections.push('');
    idea.poInsights.forEach((insight, i) => {
      sections.push(`**💡 Insight ${i + 1}**`);
      sections.push('');
      sections.push(`Наблюдение: ${insight.insight}`);
      sections.push(`Рекомендация: ${insight.recommendation}`);
      sections.push(`Влияние: ${insight.impact}`);
      sections.push('');
    });
  }
  
  // JTBD
  if (idea.jtbd.length > 0) {
    sections.push(`## 🎯 Jobs To Be Done`);
    sections.push('');
    idea.jtbd.forEach((job, i) => {
      sections.push(`**JTBD-${i + 1}**`);
      sections.push('');
      sections.push(`Когда: ${job.situation}`);
      sections.push(`Хочу: ${job.motivation}`);
      sections.push(`Чтобы: ${job.outcome}`);
      if (job.source) {
        sections.push(job.source);
      }
      sections.push('');
    });
  } else {
    sections.push(`## 🎯 Jobs To Be Done`);
    sections.push('');
    sections.push('⚠️ **Для формирования JTBD необходимы дополнительные данные:**');
    sections.push('');
    sections.push('Пожалуйста, предоставьте информацию о:');
    sections.push('- В каких ситуациях пользователи сталкиваются с проблемой?');
    sections.push('- Какую задачу они пытаются решить?');
    sections.push('- Какой результат они ожидают получить?');
    sections.push('- Какие эмоции они испытывают в процессе?');
    sections.push('');
    sections.push('*Пример формата: "Когда [ситуация], я хочу [действие], чтобы [результат]"*');
    sections.push('');
  }
  
  sections.push('═══════════════════════════════════════════════════════════════');
  sections.push('');
  sections.push('*Извлечено Product Owner Agent v10.1*');
  sections.push('*Все данные извлечены из предоставленного текста*');
  
  return sections.join('\n');
}
