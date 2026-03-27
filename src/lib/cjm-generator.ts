// CJM Generator - Customer Journey Map Generation with Professional Methodologies
// Based on UXPressia, RightHook Studio (Medium), UX Journal, UX Planet, Visual Paradigm
// v2.0 - Professional CJM with Context Extraction

/**
 * ============================================================================
 * CJM PROFESSIONAL KNOWLEDGE BASE
 * ============================================================================
 * 
 * МЕТОДОЛОГИЯ ИЗ 5 ИСТОЧНИКОВ:
 * 
 * 1. UXPressia - Customer-Centric Approach:
 *    - Персоны с демографией, целями, фрустрациями
 *    - ВСЕ touchpoints (цифровые, физические, человеческие)
 *    - Эмоциональное путешествие с оценками
 *    - Moments of Truth и Pain Points
 * 
 * 2. RightHook Studio (Medium) - Step-by-Step:
 *    - Чёткие цели карты
 *    - Research-backed персоны
 *    - Хронологические стадии
 *    - Валидация реальными данными
 * 
 * 3. UX Journal - Data-Driven:
 *    - Комбинация количественных (analytics) + качественных (интервью)
 *    - Множественные персоны для разных сегментов
 *    - Связь с Service Blueprint
 * 
 * 4. UX Planet - Comprehensive Elements:
 *    - User goals и мотивации на каждом этапе
 *    - Actions и behaviors
 *    - Emotional states с интенсивностью
 *    - Opportunities для улучшения
 * 
 * 5. Visual Paradigm - Visual Representation:
 *    - Timeline-based визуализация
 *    - Emotional journey линия
 *    - Touchpoint идентификация
 *    - Moment of Truth подсветка
 * 
 * ============================================================================
 * КЛЮЧЕВЫЕ ПРИНЦИПЫ:
 * ============================================================================
 * 
 * ❌ НЕ ИСПОЛЬЗОВАТЬ шаблоны без контекста
 * ✅ ВСЁ содержимое из транскрипции обсуждения
 * ✅ Конкретные данные вместо общих фраз
 * ✅ Персона из контекста обсуждения пользователя
 * ✅ Реальные touchpoints из обсуждения
 * ✅ Эмоции привязаны к конкретным ситуациям
 */

// === TYPE DEFINITIONS ===

export interface CJMPersona {
  name: string;
  role: string;
  demographics: {
    age: string;
    occupation: string;
    experience: string;
    techSavviness: 'low' | 'medium' | 'high';
    segment?: string;
  };
  goals: string[];
  frustrations: string[];
  motivations: string[];
  scenario: string;
  quote: string;
  // Новые поля для глубины
  contextSource: string; // Откуда взята информация
  behaviors: string[];    // Поведенческие паттерны
}

export interface CJMTouchpoint {
  type: 'digital' | 'physical' | 'human' | 'communication';
  channel: string;
  description: string;
  importance: 'critical' | 'important' | 'secondary';
  // Новые поля
  userAction: string;     // Что делает пользователь
  businessAction?: string; // Что делает бизнес
}

export interface CJMStage {
  name: string;
  order: number;
  description: string;
  userGoal: string;
  
  // Touchpoints
  touchpoints: CJMTouchpoint[];
  
  // User behavior
  userActions: string[];
  thinking: string[];
  questions: string[];
  
  // Emotional journey - улучшенная модель
  emotions: {
    primary: 'frustrated' | 'confused' | 'neutral' | 'interested' | 'satisfied' | 'delighted' | 'anxious' | 'excited';
    intensity: number; // -5 to +5
    description: string;
    triggers: string[]; // Что вызывает эту эмоцию
  };
  
  // Pain & Gain - с источниками
  painPoints: {
    point: string;
    severity: 'low' | 'medium' | 'high';
    source: string;      // Откуда известна боль
    frequency?: string;  // Как часто встречается
  }[];
  
  opportunities: {
    opportunity: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    implementation: string;
    priority?: number;   // Приоритет реализации
  }[];
  
  // Metrics
  kpis: string[];
  
  // Channels
  channels: string[];
}

export interface CustomerJourneyMap {
  // Metadata
  productName: string;
  productType: string;
  industry?: string;
  createdAt: string;
  
  // Map Purpose - новая секция
  mapPurpose: {
    primaryGoal: string;
    scope: string;
    targetAudience: string;
  };
  
  // Persona
  persona: CJMPersona;
  
  // Journey stages
  stages: CJMStage[];
  
  // Insights - улучшенные
  keyInsights: {
    insight: string;
    stage: string;
    priority: 'critical' | 'important' | 'minor';
    evidence: string; // Доказательство из данных
  }[];
  
  // Recommendations - actionable
  recommendations: {
    recommendation: string;
    rationale: string;
    expectedImpact: string;
    quickWin: boolean;
  }[];
  
  // Moments of truth - ключевые моменты
  momentsOfTruth: {
    stage: string;
    moment: string;
    currentExperience: string;
    improvementPotential: string;
    emotionalImpact: number; // -5 to +5
  }[];
  
  // Service blueprint hints
  backstageActions: string[];
  supportProcesses: string[];
  
  // Новые секции
  emotionalArc: {
    startPoint: number;
    lowestPoint: { stage: string; value: number; reason: string };
    highestPoint: { stage: string; value: number; reason: string };
    overallTrend: 'improving' | 'declining' | 'mixed';
  };
  
  // Источники данных для валидации
  dataSource: {
    hasTranscriptContext: boolean;
    hasCompetitorAnalysis: boolean;
    extractionQuality: 'high' | 'medium' | 'low';
  };
}

// === STAGE DEFINITIONS BY PRODUCT TYPE ===
// Определяем этапы на основе типа продукта

const STAGE_DEFINITIONS: Record<string, { 
  stages: Array<{ name: string; description: string; userGoal: string }>;
}> = {
  ecommerce: {
    stages: [
      { name: 'Осознание потребности', description: 'Пользователь осознаёт проблему и начинает искать решение', userGoal: 'Понять, что нужно' },
      { name: 'Поиск и исследование', description: 'Активный поиск и сравнение вариантов', userGoal: 'Найти подходящее решение' },
      { name: 'Оценка альтернатив', description: 'Детальное сравнение выбранных вариантов', userGoal: 'Выбрать лучший вариант' },
      { name: 'Принятие решения', description: 'Финальное решение о покупке', userGoal: 'Убедиться в правильности выбора' },
      { name: 'Покупка', description: 'Оформление и оплата заказа', userGoal: 'Успешно совершить покупку' },
      { name: 'Получение', description: 'Доставка и первый контакт с продуктом', userGoal: 'Получить то, что заказал' },
      { name: 'Использование', description: 'Активное использование продукта', userGoal: 'Решить свою задачу' },
      { name: 'Лояльность', description: 'Повторные покупки и рекомендации', userGoal: 'Получить максимальную ценность' }
    ]
  },
  saas: {
    stages: [
      { name: 'Осознание проблемы', description: 'Понимание бизнес-проблемы', userGoal: 'Сформулировать проблему' },
      { name: 'Поиск решения', description: 'Поиск инструментов для решения', userGoal: 'Найти подходящий инструмент' },
      { name: 'Оценка альтернатив', description: 'Сравнение SaaS-решений', userGoal: 'Выбрать оптимальное решение' },
      { name: 'Триал/Демо', description: 'Тестирование продукта', userGoal: 'Проверить подходит ли продукт' },
      { name: 'Онбординг', description: 'Первичная настройка и обучение', userGoal: 'Быстро начать работу' },
      { name: 'Активное использование', description: 'Регулярная работа с продуктом', userGoal: 'Решать рабочие задачи' },
      { name: 'Расширение', description: 'Использование дополнительных функций', userGoal: 'Получить больше ценности' },
      { name: 'Продление/Отмена', description: 'Решение о продолжении подписки', userGoal: 'Оценить ROI' }
    ]
  },
  b2b: {
    stages: [
      { name: 'Идентификация потребности', description: 'Осознание бизнес-потребности', userGoal: 'Определить требования' },
      { name: 'Поиск поставщиков', description: 'Поиск потенциальных партнёров', userGoal: 'Найти кандидатов' },
      { name: 'Оценка и сравнение', description: 'Анализ предложений', userGoal: 'Сравнить варианты' },
      { name: 'Внутреннее согласование', description: 'Согласование внутри компании', userGoal: 'Получить одобрение' },
      { name: 'Договор и внедрение', description: 'Заключение сделки и интеграция', userGoal: 'Запустить сотрудничество' },
      { name: 'Использование', description: 'Работа с поставщиком', userGoal: 'Получать ценность' },
      { name: 'Оценка результатов', description: 'Анализ эффективности', userGoal: 'Оценить результаты' },
      { name: 'Продление/Расширение', description: 'Решение о продолжении', userGoal: 'Принять решение' }
    ]
  },
  blog: {
    stages: [
      { name: 'Поиск информации', description: 'Поиск ответа на вопрос', userGoal: 'Найти релевантный контент' },
      { name: 'Открытие контента', description: 'Первый контакт с блогом', userGoal: 'Оценить ценность' },
      { name: 'Потребление контента', description: 'Чтение/просмотр контента', userGoal: 'Получить информацию' },
      { name: 'Оценка качества', description: 'Формирование мнения о контенте', userGoal: 'Понять ценность' },
      { name: 'Вовлечение', description: 'Комментарии, шеры', userGoal: 'Участвовать в обсуждении' },
      { name: 'Подписка', description: 'Решение подписаться', userGoal: 'Не пропустить новое' },
      { name: 'Лояльность', description: 'Регулярное чтение', userGoal: 'Быть в курсе' },
      { name: 'Адвокация', description: 'Рекомендации другим', userGoal: 'Поделиться ценностью' }
    ]
  },
  landing: {
    stages: [
      { name: 'Первый контакт', description: 'Клик по ссылке, открытие страницы', userGoal: 'Понять, куда попал' },
      { name: 'Изучение предложения', description: 'Сканирование контента', userGoal: 'Найти ценность' },
      { name: 'Оценка ценности', description: 'Сопоставление со своими потребностями', userGoal: 'Подходит ли мне?' },
      { name: 'Формирование доверия', description: 'Поиск доказательств', userGoal: 'Доверять или нет?' },
      { name: 'Принятие решения', description: 'Решение о целевом действии', userGoal: 'Принять решение' },
      { name: 'Целевое действие', description: 'Заполнение формы/покупка', userGoal: 'Получить то, что предлагают' }
    ]
  },
  dashboard: {
    stages: [
      { name: 'Первый вход', description: 'Логин и первый контакт', userGoal: 'Начать работу' },
      { name: 'Ознакомление', description: 'Изучение интерфейса', userGoal: 'Понять возможности' },
      { name: 'Настройка', description: 'Персонализация под себя', userGoal: 'Настроить под задачи' },
      { name: 'Ежедневное использование', description: 'Регулярная работа', userGoal: 'Решать рутинные задачи' },
      { name: 'Анализ данных', description: 'Работа с отчётами', userGoal: 'Получить инсайты' },
      { name: 'Принятие решений', description: 'Действия на основе данных', userGoal: 'Принять решение' },
      { name: 'Расширение использования', description: 'Новые функции и возможности', userGoal: 'Получить больше пользы' }
    ]
  },
  booking: {
    stages: [
      { name: 'Планирование', description: 'Понимание необходимости услуги', userGoal: 'Определить потребность' },
      { name: 'Поиск услуги', description: 'Поиск подходящего варианта', userGoal: 'Найти вариант' },
      { name: 'Выбор времени', description: 'Подбор удобного слота', userGoal: 'Найти удобное время' },
      { name: 'Бронирование', description: 'Оформление записи', userGoal: 'Успешно записаться' },
      { name: 'Ожидание', description: 'Время до получения услуги', userGoal: 'Не забыть о записи' },
      { name: 'Получение услуги', description: 'Непосредственное обслуживание', userGoal: 'Получить услугу' },
      { name: 'Оценка', description: 'Формирование мнения', userGoal: 'Оценить качество' }
    ]
  },
  app: {
    stages: [
      { name: 'Обнаружение', description: 'Узнавание о приложении', userGoal: 'Узнать о приложении' },
      { name: 'Установка', description: 'Скачивание и установка', userGoal: 'Установить приложение' },
      { name: 'Первый запуск', description: 'Первый контакт с приложением', userGoal: 'Попробовать' },
      { name: 'Онбординг', description: 'Обучение и первые шаги', userGoal: 'Понять как пользоваться' },
      { name: 'Основной сценарий', description: 'Решение главной задачи', userGoal: 'Решить свою задачу' },
      { name: 'Регулярное использование', description: 'Повседневное использование', userGoal: 'Интегрировать в рутину' },
      { name: 'Лояльность', description: 'Привязанность к приложению', userGoal: 'Получать постоянную ценность' }
    ]
  }
};

// === EMOTION TRIGGERS DATABASE ===
// Триггеры эмоций для каждого типа этапа

const EMOTION_TRIGGERS: Record<string, { 
  positive: string[]; 
  negative: string[];
  neutral: string[];
}> = {
  'Осознание потребности': {
    positive: ['Чёткое понимание проблемы', 'Увидел решение в рекламе'],
    negative: ['Непонимание сути проблемы', 'Страх перед сложностью решения'],
    neutral: ['Начал замечать проблему', 'Думает о возможных решениях']
  },
  'Поиск и исследование': {
    positive: ['Нашёл релевантный контент', 'Понятный сайт', 'Хорошие отзывы'],
    negative: ['Слишком много вариантов', 'Сложно сравнивать', 'Много шума'],
    neutral: ['Изучает разные источники', 'Собирает информацию']
  },
  'Оценка альтернатив': {
    positive: ['Ясные отличия между вариантами', 'Таблица сравнения', 'Кейсы'],
    negative: ['Непонятные отличия', 'Скрытые условия', 'Нет информации'],
    neutral: ['Сравнивает 2-3 варианта', 'Взвешивает за и против']
  },
  'Принятие решения': {
    positive: ['Есть гарантия', 'Простой процесс', 'Поддержка рядом'],
    negative: ['Страх ошибки', 'Сложная форма', 'Скрытые платежи'],
    neutral: ['Готов попробовать', 'Нужен финальный аргумент']
  },
  'Покупка': {
    positive: ['Быстрая оплата', 'Мгновенное подтверждение', 'Бонусы'],
    negative: ['Ошибка оплаты', 'Долгое ожидание', 'Технические проблемы'],
    neutral: ['Процесс оплаты', 'Ожидание подтверждения']
  },
  'Использование': {
    positive: ['Интуитивный интерфейс', 'Быстрый результат', 'Превышение ожиданий'],
    negative: ['Сложность освоения', 'Не работает как ожидал', 'Нет поддержки'],
    neutral: ['Осваивает функционал', 'Решает первую задачу']
  },
  'Лояльность': {
    positive: ['Превзошёл ожидания', 'Рекомендации работают', 'Премиум-бонусы'],
    negative: ['Проблемы с поддержкой', 'Скрытые ограничения', 'Разочарование'],
    neutral: ['Регулярное использование', 'Стабильный опыт']
  }
};

// === MAIN GENERATION FUNCTION ===

export function generateCJM(
  ideaData: {
    name: string;
    description: string;
    functions: string[];
    userTypes: string;
    valueProposition: string;
    industry?: string;
    transcriptContext?: string; // Контекст из транскрипции
  },
  productType: string = 'landing',
  competitorsData?: {
    directCompetitors?: Array<{ name: string; strengths?: string[]; weaknesses?: string[] }>;
    differentiationOpportunities?: string[];
  }
): CustomerJourneyMap {
  console.log('[CJM Generator v2.0] Starting CJM generation...');
  console.log('[CJM Generator] Product:', ideaData.name);
  console.log('[CJM Generator] Product type:', productType);
  console.log('[CJM Generator] Industry:', ideaData.industry || 'not specified');

  // 1. Get stage definitions for product type
  const stageDefinitions = STAGE_DEFINITIONS[productType] || STAGE_DEFINITIONS.landing;
  console.log('[CJM Generator] Using', stageDefinitions.stages.length, 'stages');

  // 2. Generate persona from idea data
  const persona = generatePersonaFromContext(ideaData, productType);

  // 3. Generate stages with contextual content
  const stages = generateContextualStages(
    stageDefinitions.stages, 
    ideaData, 
    productType, 
    competitorsData
  );

  // 4. Calculate emotional arc
  const emotionalArc = calculateEmotionalArc(stages);

  // 5. Extract key insights with evidence
  const keyInsights = extractKeyInsights(stages, ideaData);

  // 6. Generate actionable recommendations
  const recommendations = generateRecommendations(stages, ideaData, competitorsData);

  // 7. Identify moments of truth
  const momentsOfTruth = identifyMomentsOfTruth(stages);

  // 8. Generate service blueprint hints
  const { backstageActions, supportProcesses } = generateServiceBlueprintHints(stages);

  // 9. Determine map purpose
  const mapPurpose = {
    primaryGoal: `Понять путь пользователя ${persona.name} при работе с ${ideaData.name}`,
    scope: `От осознания потребности до достижения ценности: ${ideaData.valueProposition || 'решение задачи'}`,
    targetAudience: ideaData.userTypes || persona.role
  };

  return {
    productName: ideaData.name,
    productType,
    industry: ideaData.industry,
    createdAt: new Date().toISOString(),
    mapPurpose,
    persona,
    stages,
    keyInsights,
    recommendations,
    momentsOfTruth,
    backstageActions,
    supportProcesses,
    emotionalArc,
    dataSource: {
      hasTranscriptContext: !!ideaData.transcriptContext,
      hasCompetitorAnalysis: !!competitorsData,
      extractionQuality: ideaData.transcriptContext ? 'high' : (competitorsData ? 'medium' : 'low')
    }
  };
}

// === PERSONA GENERATION FROM CONTEXT ===

function generatePersonaFromContext(
  ideaData: { 
    name: string; 
    description: string; 
    functions: string[]; 
    userTypes: string;
    valueProposition: string;
    transcriptContext?: string;
  },
  productType: string
): CJMPersona {
  
  // Извлекаем информацию о персоне из контекста
  const extractedInfo = extractPersonaFromUserTypes(ideaData.userTypes, ideaData.transcriptContext);
  
  // Генерируем цели из функций продукта
  const goals = extractGoalsFromContext(ideaData);
  
  // Извлекаем фрустрации из описания проблемы
  const frustrations = extractFrustrationsFromContext(ideaData, extractedInfo);
  
  // Определяем мотивации
  const motivations = extractMotivationsFromContext(ideaData, extractedInfo);

  return {
    name: extractedInfo.name || 'Алексей',
    role: extractedInfo.role || 'Пользователь',
    demographics: {
      age: extractedInfo.age || '25-40',
      occupation: extractedInfo.occupation || 'Специалист',
      experience: extractedInfo.experience || 'Средний уровень',
      techSavviness: extractedInfo.techSavviness || 'medium',
      segment: extractedInfo.segment
    },
    goals,
    frustrations,
    motivations,
    scenario: buildScenarioFromContext(ideaData, extractedInfo),
    quote: ideaData.valueProposition || extractedInfo.quote || 'Хочу решить свою задачу эффективно',
    contextSource: extractedInfo.source || 'Извлечено из описания целевой аудитории',
    behaviors: extractBehaviorsFromContext(ideaData, extractedInfo)
  };
}

function extractPersonaFromUserTypes(userTypes: string, transcriptContext?: string): {
  name?: string;
  role?: string;
  age?: string;
  occupation?: string;
  experience?: string;
  techSavviness?: 'low' | 'medium' | 'high';
  segment?: string;
  quote?: string;
  source?: string;
} {
  if (!userTypes && !transcriptContext) {
    return { source: 'Базовая персона (нет данных)' };
  }

  const result: any = { source: 'Извлечено из контекста' };
  const text = `${userTypes || ''} ${transcriptContext || ''}`.toLowerCase();

  // Извлечение возраста
  const ageMatch = text.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*лет/);
  if (ageMatch) {
    result.age = `${ageMatch[1]}-${ageMatch[2]}`;
  }

  // Извлечение роли/профессии
  const rolePatterns = [
    { patterns: ['предприниматель', 'бизнесмен', 'владелец бизнеса'], role: 'Предприниматель', techSavviness: 'medium' },
    { patterns: ['разработчик', 'программист', 'it-специалист'], role: 'Разработчик', techSavviness: 'high' },
    { patterns: ['маркетолог', 'маркетинг'], role: 'Маркетолог', techSavviness: 'medium' },
    { patterns: ['менеджер', 'руководитель'], role: 'Менеджер', techSavviness: 'medium' },
    { patterns: ['студент', 'учащийся'], role: 'Студент', techSavviness: 'high' },
    { patterns: ['фрилансер', 'самозанятый'], role: 'Фрилансер', techSavviness: 'high' }
  ];

  for (const { patterns, role, techSavviness } of rolePatterns) {
    if (patterns.some(p => text.includes(p))) {
      result.role = role;
      result.techSavviness = techSavviness;
      break;
    }
  }

  // Извлечение сегмента
  const segmentPatterns = [
    { patterns: ['b2b', 'бизнес', 'корпоративный'], segment: 'B2B' },
    { patterns: ['b2c', 'потребитель', 'частный'], segment: 'B2C' },
    { patterns: ['smb', 'малый бизнес', 'малый и средний'], segment: 'SMB' },
    { patterns: ['enterprise', 'крупный бизнес', 'корпорация'], segment: 'Enterprise' }
  ];

  for (const { patterns, segment } of segmentPatterns) {
    if (patterns.some(p => text.includes(p))) {
      result.segment = segment;
      break;
    }
  }

  return result;
}

function extractGoalsFromContext(ideaData: { 
  functions: string[]; 
  valueProposition: string;
  description: string;
}): string[] {
  const goals: string[] = [];

  // Из ценностного предложения
  if (ideaData.valueProposition) {
    goals.push(ideaData.valueProposition);
  }

  // Из функций - преобразуем в цели пользователя
  if (ideaData.functions?.length > 0) {
    for (const func of ideaData.functions.slice(0, 3)) {
      const goal = transformFunctionToGoal(func);
      goals.push(goal);
    }
  }

  // Из описания
  if (ideaData.description) {
    const implicitGoals = extractImplicitGoals(ideaData.description);
    goals.push(...implicitGoals);
  }

  return [...new Set(goals)].slice(0, 5);
}

function transformFunctionToGoal(func: string): string {
  // Преобразование функции в цель пользователя
  const funcLower = func.toLowerCase();
  
  if (funcLower.includes('автоматизир')) return 'Автоматизировать рутинные процессы';
  if (funcLower.includes('анализ')) return 'Получать аналитику и инсайты';
  if (funcLower.includes('управл')) return 'Управлять процессами эффективно';
  if (funcLower.includes('созда') || funcLower.includes('генерир')) return 'Создавать контент быстро';
  if (funcLower.includes('интеграц')) return 'Интегрировать с существующими инструментами';
  if (funcLower.includes('поиск')) return 'Находить нужную информацию';
  if (funcLower.includes('коммуникац') || funcLower.includes('общение')) return 'Эффективно коммуницировать';
  if (funcLower.includes('хранен') || funcLower.includes('сохран')) return 'Безопасно хранить данные';
  
  return `Получить: ${func.toLowerCase()}`;
}

function extractImplicitGoals(description: string): string[] {
  const goals: string[] = [];
  const text = description.toLowerCase();

  // Паттерны неявных целей
  const patterns = [
    { regex: /экономи[т|ть]\s+(время|деньги|ресурсы)/, goal: 'Экономить время и ресурсы' },
    { regex: /ускори[т|ть]/, goal: 'Ускорить процессы' },
    { regex: /упрост[и|ить]/, goal: 'Упростить работу' },
    { regex: /повыс[и|ить]\s+(эффективность|продуктивность)/, goal: 'Повысить продуктивность' },
    { regex: /улучш[и|ить]/, goal: 'Улучшить результаты' }
  ];

  for (const { regex, goal } of patterns) {
    if (regex.test(text)) {
      goals.push(goal);
    }
  }

  return goals;
}

function extractFrustrationsFromContext(
  ideaData: { description: string; userTypes: string; transcriptContext?: string },
  extractedInfo: any
): string[] {
  const frustrations: string[] = [];
  const text = `${ideaData.description || ''} ${ideaData.userTypes || ''} ${ideaData.transcriptContext || ''}`.toLowerCase();

  // Извлечение фрустраций из контекста
  const frustrationPatterns = [
    { regex: /сложн[о|ая|ые]/, frustration: 'Сложность процессов' },
    { regex: /долг[о|ая|ие]/, frustration: 'Трата времени' },
    { regex: /дорог[о|ая|ие]/, frustration: 'Высокая стоимость' },
    { regex: /неудобн[о|ая|ые]/, frustration: 'Неудобство использования' },
    { regex: /непонятн[о|ая|ые]/, frustration: 'Отсутствие ясности' },
    { regex: /нет\s*(доступа|возможности|функции)/, frustration: 'Ограниченный функционал' },
    { regex: /проблем[а|ы]/, frustration: 'Существующие проблемы' },
    { regex: /боль[ше|ие]/, frustration: 'Боли текущих решений' }
  ];

  for (const { regex, frustration } of frustrationPatterns) {
    if (regex.test(text)) {
      frustrations.push(frustration);
    }
  }

  // Добавляем специфичные фрустрации на основе сегмента
  if (extractedInfo.segment === 'B2B' || extractedInfo.segment === 'Enterprise') {
    frustrations.push('Сложность внедрения');
    frustrations.push('Согласование с командой');
  }
  if (extractedInfo.segment === 'SMB') {
    frustrations.push('Ограниченный бюджет');
    frustrations.push('Нехватка времени на обучение');
  }

  // Базовые фрустрации если мало данных
  if (frustrations.length < 2) {
    frustrations.push('Выбор из множества вариантов');
    frustrations.push('Нехватка информации для решения');
  }

  return [...new Set(frustrations)].slice(0, 4);
}

function extractMotivationsFromContext(
  ideaData: { valueProposition: string; description: string },
  extractedInfo: any
): string[] {
  const motivations: string[] = [];

  if (ideaData.valueProposition) {
    motivations.push(ideaData.valueProposition);
  }

  // Базовые мотивации
  motivations.push('Экономия времени');
  motivations.push('Улучшение качества работы');

  // Специфичные мотивации по сегменту
  if (extractedInfo.segment === 'B2B') {
    motivations.push('ROI для бизнеса');
    motivations.push('Масштабирование');
  }

  return [...new Set(motivations)].slice(0, 4);
}

function buildScenarioFromContext(
  ideaData: { name: string; description: string; valueProposition: string },
  extractedInfo: any
): string {
  const parts: string[] = [];

  parts.push(extractedInfo.role ? `${extractedInfo.role}` : 'Пользователь');
  parts.push(`ищет решение для`);
  parts.push(ideaData.description?.substring(0, 50) || 'своих задач');
  parts.push(`через ${ideaData.name}`);

  if (ideaData.valueProposition) {
    parts.push(`- ${ideaData.valueProposition}`);
  }

  return parts.join(' ');
}

function extractBehaviorsFromContext(
  ideaData: { functions: string[]; description: string },
  extractedInfo: any
): string[] {
  const behaviors: string[] = [];

  // На основе функций продукта
  if (ideaData.functions?.length > 0) {
    behaviors.push(`Регулярно использует: ${ideaData.functions[0]?.toLowerCase()}`);
  }

  // На основе techSavviness
  if (extractedInfo.techSavviness === 'high') {
    behaviors.push('Быстро осваивает новые инструменты');
    behaviors.push('Использует сочетания клавиш');
  } else if (extractedInfo.techSavviness === 'low') {
    behaviors.push('Предпочитает пошаговые инструкции');
    behaviors.push('Избегает сложных функций');
  }

  return behaviors.slice(0, 3);
}

// === STAGE GENERATION WITH CONTEXT ===

function generateContextualStages(
  stageDefinitions: Array<{ name: string; description: string; userGoal: string }>,
  ideaData: { name: string; description: string; functions: string[]; valueProposition: string },
  productType: string,
  competitorsData?: { 
    directCompetitors?: Array<{ name: string; strengths?: string[]; weaknesses?: string[] }>; 
    differentiationOpportunities?: string[] 
  }
): CJMStage[] {
  const stages: CJMStage[] = [];

  for (let i = 0; i < stageDefinitions.length; i++) {
    const def = stageDefinitions[i];
    const stage = generateStageWithContext(def, i + 1, ideaData, productType, competitorsData);
    stages.push(stage);
  }

  return stages;
}

function generateStageWithContext(
  stageDef: { name: string; description: string; userGoal: string },
  order: number,
  ideaData: { name: string; description: string; functions: string[]; valueProposition: string },
  productType: string,
  competitorsData?: { 
    directCompetitors?: Array<{ name: string; strengths?: string[]; weaknesses?: string[] }>; 
    differentiationOpportunities?: string[] 
  }
): CJMStage {
  
  // Generate touchpoints for this stage
  const touchpoints = generateTouchpointsForStage(stageDef.name, ideaData);

  // Generate user actions
  const userActions = generateUserActionsForStage(stageDef.name, ideaData, productType);

  // Generate thinking
  const thinking = generateThinkingForStage(stageDef.name, ideaData);

  // Generate questions
  const questions = generateQuestionsForStage(stageDef.name, ideaData);

  // Calculate emotion with triggers
  const emotions = calculateEmotionForStage(stageDef.name, ideaData);

  // Generate pain points with sources
  const painPoints = generatePainPointsForStage(stageDef.name, ideaData, competitorsData);

  // Generate opportunities with priority
  const opportunities = generateOpportunitiesForStage(stageDef.name, ideaData, competitorsData);

  // Generate KPIs
  const kpis = generateKPIsForStage(stageDef.name, productType);

  // Generate channels
  const channels = generateChannelsForStage(stageDef.name, productType);

  return {
    name: stageDef.name,
    order,
    description: stageDef.description,
    userGoal: stageDef.userGoal,
    touchpoints,
    userActions,
    thinking,
    questions,
    emotions,
    painPoints,
    opportunities,
    kpis,
    channels
  };
}

function generateTouchpointsForStage(
  stageName: string, 
  ideaData: { name: string; functions: string[] }
): CJMTouchpoint[] {
  const touchpoints: CJMTouchpoint[] = [];

  // Определяем touchpoints по типу этапа
  const stageTouchpoints: Record<string, CJMTouchpoint[]> = {
    'Осознание потребности': [
      { type: 'communication', channel: 'Поисковая система', description: 'Поиск решения проблемы', importance: 'critical', userAction: 'Вводит запрос о проблеме' },
      { type: 'communication', channel: 'Социальные сети', description: 'Увидел обсуждение или рекламу', importance: 'important', userAction: 'Просматривает ленту' },
      { type: 'human', channel: 'Коллеги/Друзья', description: 'Личная рекомендация', importance: 'important', userAction: 'Обсуждает проблему' }
    ],
    'Поиск и исследование': [
      { type: 'digital', channel: 'Веб-сайт', description: `Изучение ${ideaData.name}`, importance: 'critical', userAction: 'Читает о продукте' },
      { type: 'digital', channel: 'Отзывы', description: 'Изучение опыта других', importance: 'important', userAction: 'Читает отзывы' },
      { type: 'digital', channel: 'Конкуренты', description: 'Сравнение с альтернативами', importance: 'important', userAction: 'Открывает сайты конкурентов' }
    ],
    'Оценка альтернатив': [
      { type: 'digital', channel: 'Сайт продукта', description: 'Детальное изучение функций', importance: 'critical', userAction: 'Изучает тарифы и функции' },
      { type: 'communication', channel: 'Чат поддержки', description: 'Вопросы о продукте', importance: 'important', userAction: 'Задаёт вопросы' },
      { type: 'digital', channel: 'Кейсы/Отзывы', description: 'Проверка реальных результатов', importance: 'important', userAction: 'Читает кейсы' }
    ],
    'Принятие решения': [
      { type: 'digital', channel: 'Форма регистрации', description: 'Создание аккаунта', importance: 'critical', userAction: 'Заполняет форму' },
      { type: 'digital', channel: 'Страница оплаты', description: 'Оформление подписки/покупки', importance: 'critical', userAction: 'Вводит платёжные данные' }
    ],
    'Покупка': [
      { type: 'digital', channel: 'Личный кабинет', description: 'Управление заказом', importance: 'important', userAction: 'Проверяет статус' },
      { type: 'communication', channel: 'Email/SMS', description: 'Уведомления', importance: 'important', userAction: 'Получает подтверждения' }
    ],
    'Использование': [
      { type: 'digital', channel: ideaData.name, description: 'Работа с продуктом', importance: 'critical', userAction: 'Использует основные функции' },
      { type: 'digital', channel: 'Помощь/FAQ', description: 'Поиск ответов', importance: 'secondary', userAction: 'Ищет информацию' },
      { type: 'human', channel: 'Поддержка', description: 'Решение проблем', importance: 'secondary', userAction: 'Обращается в поддержку' }
    ],
    'Лояльность': [
      { type: 'communication', channel: 'Email-рассылка', description: 'Обновления и новости', importance: 'secondary', userAction: 'Читает обновления' },
      { type: 'human', channel: 'Реферальная программа', description: 'Рекомендация друзьям', importance: 'important', userAction: 'Делится ссылкой' }
    ]
  };

  // Получаем базовые touchpoints для этапа
  const base = stageTouchpoints[stageName] || [
    { type: 'digital', channel: ideaData.name, description: 'Взаимодействие с продуктом', importance: 'critical', userAction: 'Использует продукт' }
  ];

  // Добавляем функции продукта как touchpoints на этапе использования
  if (stageName === 'Использование' && ideaData.functions?.length > 0) {
    for (const func of ideaData.functions.slice(0, 2)) {
      base.push({
        type: 'digital',
        channel: func,
        description: `Использование функции: ${func}`,
        importance: 'important',
        userAction: `Работает с ${func.toLowerCase()}`
      });
    }
  }

  return base.slice(0, 4);
}

function generateUserActionsForStage(
  stageName: string,
  ideaData: { name: string; functions: string[] },
  productType: string
): string[] {
  // Специфичные действия для каждого этапа
  const actionsByStage: Record<string, string[]> = {
    'Осознание потребности': [
      'Формулирует проблему для себя',
      'Ищет информацию в поиске',
      'Читает статьи о решении',
      'Обсуждает с коллегами'
    ],
    'Поиск и исследование': [
      `Открывает сайт ${ideaData.name}`,
      'Изучает функции и тарифы',
      'Читает отзывы пользователей',
      'Смотрит демонстрации/видео'
    ],
    'Оценка альтернатив': [
      'Сравнивает 2-3 варианта',
      'Оценивает стоимость владения',
      'Изучает условия гарантии',
      'Проверяет интеграции'
    ],
    'Принятие решения': [
      'Выбирает тариф',
      'Заполняет форму регистрации',
      'Проходит верификацию',
      'Оплачивает/подписывается'
    ],
    'Покупка': [
      'Получает подтверждение',
      'Ждёт доступа/доставки',
      'Готовится к использованию',
      'Изучает документацию'
    ],
    'Использование': ideaData.functions?.length > 0 
      ? [
          `Использует: ${ideaData.functions[0]}`,
          ideaData.functions[1] ? `Пробует: ${ideaData.functions[1]}` : 'Осваивает интерфейс',
          'Находит ответы в справке',
          'Интегрирует в работу'
        ]
      : ['Осваивает интерфейс', 'Проходит онбординг', 'Решает первую задачу', 'Изучает функции'],
    'Лояльность': [
      'Оценивает результаты',
      'Решает о продлении',
      'Рекомендует коллегам',
      'Использует больше функций'
    ]
  };

  return actionsByStage[stageName] || ['Взаимодействует с продуктом'];
}

function generateThinkingForStage(
  stageName: string, 
  ideaData: { name: string; valueProposition: string }
): string[] {
  const thoughtsByStage: Record<string, string[]> = {
    'Осознание потребности': [
      'У меня есть проблема, которую нужно решить',
      'Интересно, есть ли готовые решения?',
      'Сколько времени я трачу на это сейчас?'
    ],
    'Поиск и исследование': [
      `Выглядит интересно - ${ideaData.name}`,
      'Нужно понять, подойдёт ли мне',
      'Какие есть альтернативы?'
    ],
    'Оценка альтернатив': [
      'Какой вариант лучше для моих задач?',
      'Стоит ли оно этих денег?',
      'Есть ли скрытые ограничения?'
    ],
    'Принятие решения': [
      'Похоже, это то, что мне нужно',
      'Попробую, есть гарантия',
      'Надеюсь, это решит мою задачу'
    ],
    'Использование': [
      ideaData.valueProposition || 'Продукт помогает решать задачи',
      'Удобно, буду использовать дальше',
      'Хочу освоить больше функций'
    ],
    'Лояльность': [
      'Результаты оправдывают затраты',
      'Стоит рассказать коллегам',
      'Интересно, какие ещё функции есть?'
    ]
  };

  return thoughtsByStage[stageName] || ['Думаю о продукте'];
}

function generateQuestionsForStage(
  stageName: string, 
  ideaData: { name: string; description: string }
): string[] {
  const questionsByStage: Record<string, string[]> = {
    'Осознание потребности': [
      'Как решить эту проблему?',
      'Сколько это стоит в среднем?',
      'Кто уже решал подобное?'
    ],
    'Поиск и исследование': [
      `Что именно предлагает ${ideaData.name}?`,
      'Подходит ли мне этот продукт?',
      'Какие отзывы у пользователей?'
    ],
    'Оценка альтернатив': [
      'В чём преимущество перед конкурентами?',
      'Какой функционал мне реально нужен?',
      'Есть ли бесплатный период?'
    ],
    'Принятие решения': [
      'Есть ли скрытые платежи?',
      'Как быстро я смогу начать?',
      'Что если продукт не подойдёт?'
    ],
    'Использование': [
      'Как использовать эту функцию?',
      'Где найти помощь?',
      'Как интегрировать с моими инструментами?'
    ],
    'Лояльность': [
      'Оправдал ли продукт ожидания?',
      'Стоит ли перейти на другой тариф?',
      'Какие новые функции появились?'
    ]
  };

  return questionsByStage[stageName] || ['Вопросы о продукте'];
}

function calculateEmotionForStage(
  stageName: string,
  ideaData: { name: string; valueProposition: string }
): CJMStage['emotions'] {
  // Базовые эмоциональные паттерны
  const emotionPatterns: Record<string, { 
    primary: CJMStage['emotions']['primary']; 
    intensity: number; 
    description: string;
  }> = {
    'Осознание потребности': { 
      primary: 'neutral', 
      intensity: -1, 
      description: 'Потребность есть, решение не найдено' 
    },
    'Поиск и исследование': { 
      primary: 'interested', 
      intensity: 1, 
      description: 'Изучение возможностей, надежда на решение' 
    },
    'Оценка альтернатив': { 
      primary: 'confused', 
      intensity: 0, 
      description: 'Много вариантов, сложно сравнивать' 
    },
    'Принятие решения': { 
      primary: 'anxious', 
      intensity: -1, 
      description: 'Страх ошибки, волнение перед покупкой' 
    },
    'Покупка': { 
      primary: 'excited', 
      intensity: 2, 
      description: 'Ожидание получения ценности' 
    },
    'Использование': { 
      primary: 'satisfied', 
      intensity: 3, 
      description: 'Продукт работает, решает задачи' 
    },
    'Лояльность': { 
      primary: 'delighted', 
      intensity: 4, 
      description: 'Полное удовлетворение, рекомендации' 
    }
  };

  const base = emotionPatterns[stageName] || { 
    primary: 'neutral', 
    intensity: 0, 
    description: 'Стандартный этап' 
  };

  // Получаем триггеры для этого этапа
  const triggers = EMOTION_TRIGGERS[stageName] || { positive: [], negative: [], neutral: [] };

  return {
    primary: base.primary,
    intensity: base.intensity,
    description: base.description,
    triggers: [
      ...triggers.negative.slice(0, 1),
      ...triggers.positive.slice(0, 2)
    ].filter(Boolean)
  };
}

function generatePainPointsForStage(
  stageName: string,
  ideaData: { name: string; functions: string[] },
  competitorsData?: { 
    directCompetitors?: Array<{ name: string; weaknesses?: string[] }>; 
  }
): CJMStage['painPoints'] {
  const painsByStage: Record<string, Array<{ 
    point: string; 
    severity: 'low' | 'medium' | 'high'; 
    source: string;
    frequency?: string;
  }>> = {
    'Осознание потребности': [
      { point: 'Неясно, с чего начать поиск решения', severity: 'medium', source: 'Типичная боль на этапе осознания', frequency: 'часто' },
      { point: 'Нет чёткого понимания проблемы', severity: 'low', source: 'Отсутствие экспертизы в области', frequency: 'иногда' }
    ],
    'Поиск и исследование': [
      { point: 'Слишком много вариантов, сложно выбрать', severity: 'high', source: 'Перегрузка информацией', frequency: 'часто' },
      { point: 'Недостаточно информации для сравнения', severity: 'medium', source: 'Непрозрачность конкурентов', frequency: 'часто' }
    ],
    'Оценка альтернатив': [
      { point: 'Непонятные отличия от конкурентов', severity: 'high', source: 'Отсутствие сравнения', frequency: 'часто' },
      { point: 'Скрытые условия и ограничения', severity: 'medium', source: 'Непрозрачность тарифов', frequency: 'иногда' }
    ],
    'Принятие решения': [
      { point: 'Страх ошибиться с выбором', severity: 'high', source: 'Психологический барьер', frequency: 'часто' },
      { point: 'Сложный процесс оформления', severity: 'medium', source: 'UX проблемы', frequency: 'иногда' }
    ],
    'Использование': [
      { point: 'Кривая обучения новому продукту', severity: 'medium', source: 'Новое ПО требует времени', frequency: 'всегда' },
      { point: 'Не все функции очевидны', severity: 'low', source: 'UX проблемы', frequency: 'часто' }
    ],
    'Лояльность': [
      { point: 'Нет чётких критериев успеха', severity: 'low', source: 'Отсутствие метрик', frequency: 'иногда' },
      { point: 'Забываются возможности продукта', severity: 'low', source: 'Редкое использование', frequency: 'иногда' }
    ]
  };

  let pains = [...(painsByStage[stageName] || [])];

  // Добавляем боли конкурентов на этапе сравнения
  if (competitorsData?.directCompetitors?.length && stageName === 'Оценка альтернатив') {
    for (const comp of competitorsData.directCompetitors.slice(0, 2)) {
      if (comp.weaknesses?.length) {
        pains.push({
          point: `${comp.name}: ${comp.weaknesses[0]}`,
          severity: 'medium',
          source: 'Анализ конкурентов',
          frequency: 'при сравнении'
        });
      }
    }
  }

  return pains.slice(0, 3);
}

function generateOpportunitiesForStage(
  stageName: string,
  ideaData: { name: string; functions: string[]; valueProposition: string },
  competitorsData?: { 
    directCompetitors?: Array<{ name: string; weaknesses?: string[] }>; 
    differentiationOpportunities?: string[] 
  }
): CJMStage['opportunities'] {
  const oppsByStage: Record<string, Array<{ 
    opportunity: string; 
    impact: 'low' | 'medium' | 'high'; 
    effort: 'low' | 'medium' | 'high'; 
    implementation: string;
    priority?: number;
  }>> = {
    'Осознание потребности': [
      { opportunity: 'SEO-контент под боли аудитории', impact: 'high', effort: 'medium', implementation: 'Контент-маркетинг', priority: 1 },
      { opportunity: 'Таргетированная реклама проблемы', impact: 'high', effort: 'low', implementation: 'Performance маркетинг', priority: 2 }
    ],
    'Поиск и исследование': [
      { opportunity: 'Ясное УТП на первом экране', impact: 'high', effort: 'low', implementation: 'Дизайн лендинга', priority: 1 },
      { opportunity: 'Социальные доказательства', impact: 'high', effort: 'medium', implementation: 'Social proof', priority: 2 },
      { opportunity: 'Интерактивная демонстрация', impact: 'medium', effort: 'medium', implementation: 'Product feature', priority: 3 }
    ],
    'Оценка альтернатив': [
      { opportunity: 'Таблица сравнения с конкурентами', impact: 'high', effort: 'low', implementation: 'Контент', priority: 1 },
      { opportunity: 'Калькулятор ROI/ценности', impact: 'medium', effort: 'medium', implementation: 'Интерактив', priority: 2 }
    ],
    'Принятие решения': [
      { opportunity: 'Упрощённая форма регистрации', impact: 'high', effort: 'low', implementation: 'UX оптимизация', priority: 1 },
      { opportunity: 'Гарантия/Триал период', impact: 'high', effort: 'low', implementation: 'Бизнес-модель', priority: 1 },
      { opportunity: 'Онлайн-консультант', impact: 'medium', effort: 'low', implementation: 'Сервис', priority: 2 }
    ],
    'Использование': [
      { opportunity: 'Интерактивный онбординг', impact: 'high', effort: 'medium', implementation: 'Product feature', priority: 1 },
      { opportunity: 'Контекстная помощь', impact: 'medium', effort: 'low', implementation: 'UX улучшение', priority: 2 },
      { opportunity: 'Быстрые результаты (quick wins)', impact: 'high', effort: 'medium', implementation: 'Product design', priority: 1 }
    ],
    'Лояльность': [
      { opportunity: 'Дашборд результатов/ценности', impact: 'medium', effort: 'medium', implementation: 'Product feature', priority: 2 },
      { opportunity: 'Реферальная программа', impact: 'high', effort: 'low', implementation: 'Маркетинг', priority: 1 },
      { opportunity: 'Регулярные обновления', impact: 'medium', effort: 'low', implementation: 'Коммуникации', priority: 3 }
    ]
  };

  let opps = [...(oppsByStage[stageName] || [])];

  // Добавляем возможности дифференциации
  if (competitorsData?.differentiationOpportunities?.length) {
    for (const diff of competitorsData.differentiationOpportunities.slice(0, 2)) {
      opps.push({
        opportunity: diff,
        impact: 'high',
        effort: 'medium',
        implementation: 'Дифференциация',
        priority: 1
      });
    }
  }

  // Сортируем по приоритету
  opps.sort((a, b) => (a.priority || 99) - (b.priority || 99));

  return opps.slice(0, 4);
}

function generateKPIsForStage(stageName: string, productType: string): string[] {
  const kpisByStage: Record<string, string[]> = {
    'Осознание потребности': ['Охват целевой аудитории', 'Узнаваемость бренда', 'Показы в поиске'],
    'Поиск и исследование': ['Трафик на сайт', 'Время на странице', 'Глубина просмотра'],
    'Оценка альтернатив': ['Вовлечённость', 'Сравнения', 'Возвраты на сайт'],
    'Принятие решения': ['Конверсия в регистрацию', 'Брошенные корзины', 'Время до конверсии'],
    'Покупка': ['Успешные оплаты', 'Средний чек', 'Время транзакции'],
    'Использование': ['DAU/MAU', 'Retention D1/D7/D30', 'Используемые функции'],
    'Лояльность': ['NPS', 'CSAT', 'Рефералы', 'LTV']
  };

  return kpisByStage[stageName] || ['Метрики этапа'];
}

function generateChannelsForStage(stageName: string, productType: string): string[] {
  const channelsByStage: Record<string, string[]> = {
    'Осознание потребности': ['Поиск', 'Соцсети', 'Реклама', 'Сарафанное радио'],
    'Поиск и исследование': ['Сайт', 'Отзывы', 'Блог', 'YouTube'],
    'Оценка альтернатив': ['Сайт', 'Сравнительные площадки', 'Обзоры'],
    'Принятие решения': ['Сайт', 'Мобильное приложение', 'Партнёры'],
    'Использование': ['Продукт', 'Поддержка', 'Документация', 'Сообщество']
  };

  return channelsByStage[stageName] || ['Онлайн'];
}

// === EMOTIONAL ARC CALCULATION ===

function calculateEmotionalArc(stages: CJMStage[]): CustomerJourneyMap['emotionalArc'] {
  if (stages.length === 0) {
    return {
      startPoint: 0,
      lowestPoint: { stage: 'N/A', value: 0, reason: 'Нет данных' },
      highestPoint: { stage: 'N/A', value: 0, reason: 'Нет данных' },
      overallTrend: 'mixed'
    };
  }

  const startPoint = stages[0].emotions.intensity;
  
  // Find lowest point
  const lowestStage = stages.reduce((min, s) => 
    s.emotions.intensity < min.emotions.intensity ? s : min
  );
  
  // Find highest point
  const highestStage = stages.reduce((max, s) => 
    s.emotions.intensity > max.emotions.intensity ? s : max
  );

  // Determine trend
  const lastIntensity = stages[stages.length - 1].emotions.intensity;
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
      value: lowestStage.emotions.intensity,
      reason: lowestStage.emotions.description
    },
    highestPoint: {
      stage: highestStage.name,
      value: highestStage.emotions.intensity,
      reason: highestStage.emotions.description
    },
    overallTrend
  };
}

// === KEY INSIGHTS EXTRACTION ===

function extractKeyInsights(
  stages: CJMStage[], 
  ideaData: { name: string }
): CustomerJourneyMap['keyInsights'] {
  const insights: CustomerJourneyMap['keyInsights'] = [];

  // Find stages with critical pain points
  for (const stage of stages) {
    const criticalPains = stage.painPoints.filter(p => p.severity === 'high');
    if (criticalPains.length > 0) {
      insights.push({
        insight: `Критические боли на этапе "${stage.name}": ${criticalPains.map(p => p.point).join(', ')}`,
        stage: stage.name,
        priority: 'critical',
        evidence: `Найдено ${criticalPains.length} критических проблем`
      });
    }
  }

  // Find emotional dips
  for (const stage of stages) {
    if (stage.emotions.intensity < 0) {
      insights.push({
        insight: `Негативный эмоциональный пик на "${stage.name}" требует внимания`,
        stage: stage.name,
        priority: 'important',
        evidence: `Эмоциональная оценка: ${stage.emotions.intensity}, причина: ${stage.emotions.description}`
      });
    }
  }

  // Find quick wins (high impact, low effort)
  const quickWins: string[] = [];
  for (const stage of stages) {
    const quick = stage.opportunities.filter(o => o.impact === 'high' && o.effort === 'low');
    if (quick.length > 0) {
      quickWins.push(`"${stage.name}": ${quick[0].opportunity}`);
    }
  }
  
  if (quickWins.length > 0) {
    insights.push({
      insight: `Быстрые победы: ${quickWins.slice(0, 2).join('; ')}`,
      stage: 'Общее',
      priority: 'important',
      evidence: 'Высокий эффект при низких затратах'
    });
  }

  return insights.slice(0, 5);
}

// === RECOMMENDATIONS GENERATION ===

function generateRecommendations(
  stages: CJMStage[],
  ideaData: { name: string; functions: string[] },
  competitorsData?: { 
    directCompetitors?: Array<{ name: string; strengths?: string[]; weaknesses?: string[] }>; 
    differentiationOpportunities?: string[] 
  }
): CustomerJourneyMap['recommendations'] {
  const recommendations: CustomerJourneyMap['recommendations'] = [];

  // Quick wins first
  for (const stage of stages) {
    const quickWins = stage.opportunities.filter(o => o.impact === 'high' && o.effort === 'low');
    for (const win of quickWins) {
      recommendations.push({
        recommendation: win.opportunity,
        rationale: `Быстрая победа на этапе "${stage.name}"`,
        expectedImpact: 'Высокий эффект при минимальных затратах',
        quickWin: true
      });
    }
  }

  // Focus on stages with most pain
  const painfulStages = [...stages]
    .sort((a, b) => b.painPoints.length - a.painPoints.length)
    .slice(0, 2);

  for (const stage of painfulStages) {
    if (stage.painPoints.length > 0) {
      recommendations.push({
        recommendation: `Устранить боли на "${stage.name}": ${stage.painPoints[0].point}`,
        rationale: `Этап с наибольшим количеством проблем`,
        expectedImpact: 'Улучшение общего впечатления пользователя',
        quickWin: stage.painPoints[0].severity !== 'high'
      });
    }
  }

  // Competitor-based recommendations
  if (competitorsData?.differentiationOpportunities?.length) {
    recommendations.push({
      recommendation: `Дифференциация: ${competitorsData.differentiationOpportunities[0]}`,
      rationale: 'Выделение на фоне конкурентов',
      expectedImpact: 'Конкурентное преимущество',
      quickWin: false
    });
  }

  return recommendations.slice(0, 6);
}

// === MOMENTS OF TRUTH IDENTIFICATION ===

function identifyMomentsOfTruth(stages: CJMStage[]): CustomerJourneyMap['momentsOfTruth'] {
  const moments: CustomerJourneyMap['momentsOfTruth'] = [];

  // Critical touchpoints
  for (const stage of stages) {
    const criticalTouchpoints = stage.touchpoints.filter(t => t.importance === 'critical');
    
    for (const tp of criticalTouchpoints) {
      moments.push({
        stage: stage.name,
        moment: tp.channel,
        currentExperience: tp.description,
        improvementPotential: stage.opportunities[0]?.opportunity || 'Оптимизировать взаимодействие',
        emotionalImpact: stage.emotions.intensity
      });
    }
  }

  // Stages with strong emotions (positive or negative)
  for (const stage of stages) {
    if (Math.abs(stage.emotions.intensity) >= 3) {
      moments.push({
        stage: stage.name,
        moment: `Эмоциональный пик: ${stage.emotions.description}`,
        currentExperience: stage.emotions.primary,
        improvementPotential: stage.emotions.intensity < 0 
          ? 'Снизить негатив через: ' + stage.opportunities[0]?.opportunity
          : 'Усилить позитив через рекомендации',
        emotionalImpact: stage.emotions.intensity
      });
    }
  }

  return moments.slice(0, 5);
}

// === SERVICE BLUEPRINT HINTS ===

function generateServiceBlueprintHints(stages: CJMStage[]): {
  backstageActions: string[];
  supportProcesses: string[];
} {
  const backstageActions: string[] = [];
  const supportProcesses: string[] = [];

  for (const stage of stages) {
    // Backstage actions based on touchpoints
    if (stage.touchpoints.some(t => t.type === 'human')) {
      backstageActions.push(`Поддержка на этапе "${stage.name}"`);
    }
    if (stage.touchpoints.some(t => t.channel.includes('Email') || t.channel.includes('SMS'))) {
      backstageActions.push(`Отправка уведомлений для "${stage.name}"`);
    }
  }

  // Common support processes
  supportProcesses.push('CRM для отслеживания пути клиента');
  supportProcesses.push('Система аналитики для KPI');
  supportProcesses.push('База знаний для поддержки');

  return {
    backstageActions: [...new Set(backstageActions)].slice(0, 5),
    supportProcesses
  };
}

// === MERMAID GENERATION ===

export function generateCJMMermaid(cjm: CustomerJourneyMap): string {
  const lines: string[] = [];
  
  lines.push('```mermaid');
  lines.push('%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#e1f5fe", "secondaryColor": "#fff3e0"}}}%%');
  lines.push('');
  lines.push('journey');
  lines.push(`    title Customer Journey: ${cjm.persona.name} - ${cjm.persona.role}`);
  lines.push('');

  for (const stage of cjm.stages) {
    const sectionName = stage.name;
    lines.push(`    section ${sectionName}`);
    
    // Add actions with emotion scores
    for (let i = 0; i < Math.min(stage.userActions.length, 3); i++) {
      const action = stage.userActions[i];
      const score = stage.emotions.intensity + 5; // Convert -5..+5 to 0..10
      lines.push(`      ${action}: ${score} : ${stage.emotions.primary}`);
    }
  }

  lines.push('```');
  
  return lines.join('\n');
}

// === MARKDOWN FORMATTING ===

export function formatCJMAsMarkdown(cjm: CustomerJourneyMap): string {
  const lines: string[] = [];

  lines.push(`# Customer Journey Map: ${cjm.productName}`);
  lines.push('');
  lines.push(`*Создано: ${new Date(cjm.createdAt).toLocaleDateString('ru-RU')}*`);
  lines.push('');

  // Map Purpose
  lines.push('## Цель карты');
  lines.push('');
  lines.push(`**Основная цель:** ${cjm.mapPurpose.primaryGoal}`);
  lines.push(`**Область:** ${cjm.mapPurpose.scope}`);
  lines.push(`**Целевая аудитория:** ${cjm.mapPurpose.targetAudience}`);
  lines.push('');

  // Persona
  lines.push('## Персона');
  lines.push('');
  lines.push(`### ${cjm.persona.name} - ${cjm.persona.role}`);
  lines.push('');
  lines.push(`**Демография:** ${cjm.persona.demographics.age}, ${cjm.persona.demographics.occupation}`);
  lines.push(`**Тех-грамотность:** ${cjm.persona.demographics.techSavviness}`);
  lines.push('');
  lines.push('**Цели:**');
  for (const goal of cjm.persona.goals) {
    lines.push(`- ${goal}`);
  }
  lines.push('');
  lines.push('**Фрустрации:**');
  for (const frustration of cjm.persona.frustrations) {
    lines.push(`- ${frustration}`);
  }
  lines.push('');
  lines.push('**Мотивации:**');
  for (const motivation of cjm.persona.motivations) {
    lines.push(`- ${motivation}`);
  }
  lines.push('');
  lines.push(`> "${cjm.persona.quote}"`);
  lines.push('');

  // Stages
  lines.push('## Этапы путешествия');
  lines.push('');

  for (const stage of cjm.stages) {
    lines.push(`### ${stage.order}. ${stage.name}`);
    lines.push('');
    lines.push(`*${stage.description}*`);
    lines.push('');
    lines.push(`**Цель пользователя:** ${stage.userGoal}`);
    lines.push('');

    lines.push('**Touchpoints:**');
    for (const tp of stage.touchpoints) {
      lines.push(`- ${tp.channel}: ${tp.description} (${tp.importance})`);
    }
    lines.push('');

    lines.push('**Действия:**');
    for (const action of stage.userActions) {
      lines.push(`- ${action}`);
    }
    lines.push('');

    lines.push(`**Эмоции:** ${stage.emotions.primary} (${stage.emotions.intensity > 0 ? '+' : ''}${stage.emotions.intensity})`);
    lines.push(`*${stage.emotions.description}*`);
    lines.push('');

    if (stage.painPoints.length > 0) {
      lines.push('**Боли:**');
      for (const pain of stage.painPoints) {
        lines.push(`- [${pain.severity}] ${pain.point}`);
      }
      lines.push('');
    }

    if (stage.opportunities.length > 0) {
      lines.push('**Возможности:**');
      for (const opp of stage.opportunities) {
        lines.push(`- ${opp.opportunity} (impact: ${opp.impact}, effort: ${opp.effort})`);
      }
      lines.push('');
    }
  }

  // Key Insights
  lines.push('## Ключевые инсайты');
  lines.push('');
  for (const insight of cjm.keyInsights) {
    lines.push(`- [${insight.priority}] **${insight.stage}:** ${insight.insight}`);
    lines.push(`  *Доказательство: ${insight.evidence}*`);
  }
  lines.push('');

  // Recommendations
  lines.push('## Рекомендации');
  lines.push('');
  for (const rec of cjm.recommendations) {
    const badge = rec.quickWin ? ' [Quick Win]' : '';
    lines.push(`- **${rec.recommendation}**${badge}`);
    lines.push(`  ${rec.rationale}. ${rec.expectedImpact}`);
  }
  lines.push('');

  // Moments of Truth
  lines.push('## Моменты истины');
  lines.push('');
  for (const mot of cjm.momentsOfTruth) {
    lines.push(`- **${mot.stage}:** ${mot.moment}`);
    lines.push(`  Текущий опыт: ${mot.currentExperience}`);
    lines.push(`  Потенциал улучшения: ${mot.improvementPotential}`);
  }
  lines.push('');

  // Emotional Arc
  lines.push('## Эмоциональная дуга');
  lines.push('');
  lines.push(`- **Начало:** ${cjm.emotionalArc.startPoint}`);
  lines.push(`- **Низшая точка:** ${cjm.emotionalArc.lowestPoint.stage} (${cjm.emotionalArc.lowestPoint.value}) - ${cjm.emotionalArc.lowestPoint.reason}`);
  lines.push(`- **Высшая точка:** ${cjm.emotionalArc.highestPoint.stage} (${cjm.emotionalArc.highestPoint.value}) - ${cjm.emotionalArc.highestPoint.reason}`);
  lines.push(`- **Общий тренд:** ${cjm.emotionalArc.overallTrend === 'improving' ? 'Улучшение' : cjm.emotionalArc.overallTrend === 'declining' ? 'Ухудшение' : 'Смешанный'}`);
  lines.push('');

  return lines.join('\n');
}
