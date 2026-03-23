// Idea Extractor - Product Owner with 10 Years Experience
// v9.0 - Precise extraction: NO generic phrases, ONLY actual data from text

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
  extractionLog: string[]; // Для отладки - что именно извлечено
}

/**
 * INDUSTRY KNOWLEDGE BASE
 */
const INDUSTRY_DATABASE: Record<string, {
  patterns: RegExp[];
  subIndustries: { patterns: RegExp[]; name: string }[];
  marketContext: string;
  typicalFeatures: string[];
  metrics: string[];
  competitors: string[];
}> = {
  'EdTech': {
    patterns: [/(edtech|обучени[ею]|курс|урок|студент|учител|школьн|образован|lms|преподава|учебн|знан|лекци|семинар|webinar|мастер-класс)/i],
    subIndustries: [
      { patterns: [/онлайн.*школ|школьн.*образов/i], name: 'Онлайн-школы' },
      { patterns: [/корпоративн.*обучен|обучен.*сотрудник/i], name: 'Корпоративное обучение' },
      { patterns: [/детск|дошкольн|подготовк.*школ/i], name: 'Детское образование' },
      { patterns: [/профессиональн|переподготов|повышен.*квалифик/i], name: 'Профпереподготовка' },
      { patterns: [/язык.*обучен|английск|иностр.*язык/i], name: 'Языковые курсы' },
    ],
    marketContext: 'Рынок онлайн-образования растет 20-30% в год. Ключевые драйверы: удаленка, рескиллинг.',
    typicalFeatures: ['Видеокурсы', 'Тестирование', 'Сертификаты', 'Прогресс-трекинг', 'Вебинары'],
    metrics: ['Completion Rate', 'Retention', 'NPS', 'LTV/CAC'],
    competitors: ['Skillbox', 'GeekBrains', 'Нетология', 'Coursera'],
  },
  'FinTech': {
    patterns: [/(fintech|платеж|перевод|кредит|страхов|инвестиц|банк|финанс|кошел|карт[аы]|деньг|счет|транзакц|вклад|крипт)/i],
    subIndustries: [
      { patterns: [/пла(теж|тёж)|перевод.*денег|p2p/i], name: 'Платежные системы' },
      { patterns: [/кредит|займ|микрофинан/i], name: 'Кредитование' },
      { patterns: [/инвестиц|брокер|акци|бирж/i], name: 'Инвестиционные платформы' },
      { patterns: [/бухгалтер|учет|налог|отчетност/i], name: 'Финучет' },
      { patterns: [/бюджет|учет.*расход|деньг.*управлен/i], name: 'Личные финансы' },
    ],
    marketContext: 'FinTech - быстрорастущий сектор. Ключевое - доверие и безопасность.',
    typicalFeatures: ['Переводы', 'Баланс', 'История', 'Биллинг', 'KYC'],
    metrics: ['MAU', 'GMV', 'Take rate', 'NPS'],
    competitors: ['Тинькофф', 'Сбер', 'Точка', 'Revolut'],
  },
  'HealthTech': {
    patterns: [/(healthtech|медицин|врач|пациент|клиник|здоровь|аптек|диагност|telemed|телемед|лечен|болезн|симптом|рецепт)/i],
    subIndustries: [
      { patterns: [/телемед|онлайн.*врач|консультац.*врач/i], name: 'Телемедицина' },
      { patterns: [/аптек|лекарств|препарат/i], name: 'E-pharmacy' },
      { patterns: [/клиник|запис.*врач|прием/i], name: 'Управление клиникой' },
      { patterns: [/психолог|психотерап|ментальн/i], name: 'Mental Health' },
      { patterns: [/фитнес|зож|диет|питан|калор/i], name: 'Здоровый образ жизни' },
    ],
    marketContext: 'Рынок медицины консервативен. Регуляторика строгая.',
    typicalFeatures: ['Запись к врачу', 'Электронная карта', 'Чат с врачом', 'Напоминания'],
    metrics: ['Пациенты', 'Записи', 'Retention', 'Средний чек'],
    competitors: ['СберЗдоровье', 'Доктор рядом', 'ProDoctorov'],
  },
  'E-commerce': {
    patterns: [/(ecommerce|магазин|товар|корзин|доставк|заказ|покупк|продаж|маркетплейс|ритейл|каталог|чекаут)/i],
    subIndustries: [
      { patterns: [/маркетплейс|продавец|селлер/i], name: 'Маркетплейсы' },
      { patterns: [/доставк.*продукт|продукт.*доставк/i], name: 'Grocery delivery' },
      { patterns: [/одежд|обувь|fashion/i], name: 'Fashion e-commerce' },
      { patterns: [/электроник|техник|гадж/i], name: 'Electronics' },
    ],
    marketContext: 'E-commerce растет 30%+ в год. Ключевое - логистика, персонализация.',
    typicalFeatures: ['Каталог', 'Корзина', 'Чекаут', 'Доставка', 'Оплата', 'Отзывы'],
    metrics: ['Conversion Rate', 'AOV', 'LTV', 'Return Rate'],
    competitors: ['Ozon', 'Wildberries', 'Яндекс.Маркет'],
  },
  'FoodTech': {
    patterns: [/(foodtech|ресторан|кафе|ед[аы]|пищ|меню|бронир.*столик|доставк.*ед|рецепт|готовк|кулин)/i],
    subIndustries: [
      { patterns: [/доставк.*ед|ед.*доставк/i], name: 'Доставка еды' },
      { patterns: [/ресторан|кафе|столик/i], name: 'Ресторанный бизнес' },
      { patterns: [/рецепт|готовк|кулин/i], name: 'Рецепты и готовка' },
    ],
    marketContext: 'FoodTech показывает взрывной рост. Ключевое - скорость и качество.',
    typicalFeatures: ['Меню', 'Корзина', 'Доставка', 'Отслеживание', 'Отзывы'],
    metrics: ['Orders', 'AOV', 'Delivery Time', 'Rating'],
    competitors: ['Яндекс.Еда', 'Delivery Club', 'Самокат'],
  },
  'HRTech': {
    patterns: [/(hrtech|hr|рекрут|ваканси|резюме|сотрудник|кадр|персонал|онбординг|зарплат|отпуск|график)/i],
    subIndustries: [
      { patterns: [/ваканси|резюме|поиск.*работ|рекрут/i], name: 'Рекрутинг' },
      { patterns: [/онбординг|адаптац.*сотрудник/i], name: 'Онбординг' },
      { patterns: [/зарплат|расчет.*зп|payroll/i], name: 'Зарплатные системы' },
    ],
    marketContext: 'HR-технологии на подъеме. B2B продажи, длинные циклы.',
    typicalFeatures: ['Вакансии', 'Отклики', 'Календарь', 'Анкеты', 'Отчеты'],
    metrics: ['Time to Hire', 'Cost per Hire', 'Retention'],
    competitors: ['hh.ru', 'Habr Career', 'SuperJob'],
  },
  'MarTech': {
    patterns: [/(martech|маркетинг|реклам|кампани[яи]|лид|конверси|crm|воронк|email|рассылк|трафик|seo|контекст)/i],
    subIndustries: [
      { patterns: [/crm|клиент.*баз|сделк/i], name: 'CRM системы' },
      { patterns: [/email|рассылк/i], name: 'Email-маркетинг' },
      { patterns: [/аналитик|метрик|дашборд/i], name: 'Маркетинговая аналитика' },
    ],
    marketContext: 'MarTech-рынок переполнен. Ключевое - интеграции и ROI.',
    typicalFeatures: ['Кампании', 'Сегментация', 'Автоматизация', 'Аналитика'],
    metrics: ['ROI', 'Cost per Lead', 'Conversion Rate', 'CTR'],
    competitors: ['Битрикс24', 'AmoCRM', 'Unisender'],
  },
  'PropTech': {
    patterns: [/(proptech|недвижим|квартир|дом|аренд|покупк.*жил|риэлтор|агентств.*недв|жил[ьъ]|ипотек)/i],
    subIndustries: [
      { patterns: [/аренд|съем|сда.*квартир/i], name: 'Аренда' },
      { patterns: [/покупк|продаж.*недв|ипотек/i], name: 'Продажа недвижимости' },
      { patterns: [/строительств|застройщик|новостро/i], name: 'Девелопмент' },
    ],
    marketContext: 'PropTech трансформируется. Ключевое - доверие, качество данных.',
    typicalFeatures: ['Поиск', 'Фильтры', 'Карта', 'Фото', 'Контакты'],
    metrics: ['Leads', 'Conversion to Deal', 'Time to Close'],
    competitors: ['Циан', 'Авито Недвижимость', 'Домклик'],
  },
  'Logistics': {
    patterns: [/(logistics|логист|склад|груз|перевозк|транспорт|маршрут|доставк.*груз|грузоперевоз)/i],
    subIndustries: [
      { patterns: [/склад|хранен|wms/i], name: 'Складская логистика' },
      { patterns: [/перевозк|транспорт|фура|груз/i], name: 'Грузоперевозки' },
      { patterns: [/отслеживан|track|мониторинг.*транспорт/i], name: 'Трекинг и мониторинг' },
    ],
    marketContext: 'Логистика - backbone e-commerce. Ключевое - оптимизация, прозрачность.',
    typicalFeatures: ['Трекинг', 'Маршрутизация', 'Складской учет'],
    metrics: ['On-time delivery', 'Cost per delivery', 'Claims rate'],
    competitors: ['СДЭК', 'Яндекс.Доставка', 'СДЕК'],
  },
  'SaaS/B2B': {
    patterns: [/(saas|b2b|предприят|бизнес.*решен|корпорат|интеграц|erp|бухгалтер|учет|автоматиз.*процесс)/i],
    subIndustries: [
      { patterns: [/erp|учет.*предприят/i], name: 'ERP системы' },
      { patterns: [/crm|продаж|клиент/i], name: 'CRM' },
      { patterns: [/проект|задач|trello|kanban/i], name: 'Project Management' },
      { patterns: [/документ|эдо|подпис/i], name: 'Документооборот' },
    ],
    marketContext: 'SaaS - устойчивая модель. Ключевое - Churn reduction.',
    typicalFeatures: ['Дашборд', 'Настройки', 'Интеграции', 'API', 'Роли'],
    metrics: ['MRR', 'ARR', 'Churn Rate', 'CAC', 'LTV'],
    competitors: ['Битрикс24', 'amoCRM', 'Jira', 'Notion'],
  },
  'AI/ML': {
    patterns: [/(ai|ии|искусствен.*интеллект|нейросет|машинн.*обучен|ml|gpt|llm|автоматиз|генер|chatgpt)/i],
    subIndustries: [
      { patterns: [/генер.*контент|создан.*контент|написа.*текст/i], name: 'Generative AI' },
      { patterns: [/распознаван|vision|изображен|видео.*анализ/i], name: 'Computer Vision' },
      { patterns: [/чат.*бот|ассистент|поддержк/i], name: 'AI Chatbots' },
    ],
    marketContext: 'AI - хайп + реальная ценность. Ключевое - product-market fit.',
    typicalFeatures: ['AI API', 'Модели', 'Промпты', 'Инференс'],
    metrics: ['API calls', 'Latency', 'Accuracy', 'User adoption'],
    competitors: ['OpenAI', 'Anthropic', 'YandexGPT'],
  },
  'TravelTech': {
    patterns: [/(travel|туризм|путешеств|отель|бронир.*билет|самолет|поезд|тур|авиабилет|гостиниц)/i],
    subIndustries: [
      { patterns: [/отель|гостиниц|проживан/i], name: 'Бронирование отелей' },
      { patterns: [/авиабилет|самолет|перелет/i], name: 'Авиабилеты' },
      { patterns: [/тур|туроператор|путевк/i], name: 'Турпродукты' },
    ],
    marketContext: 'Travel восстанавливается. Ключевое - персонализация.',
    typicalFeatures: ['Поиск', 'Фильтры', 'Бронирование', 'Оплата'],
    metrics: ['Bookings', 'Conversion', 'Average Booking Value'],
    competitors: ['Яндекс.Путешествия', 'Ostrovok', 'Aviasales'],
  },
  'MediaTech': {
    patterns: [/(media|контент|видео|аудио|подкаст|стать[яи]|блог|новост|медиа|издани|журнал)/i],
    subIndustries: [
      { patterns: [/видео|стрим|youtube|видеохост/i], name: 'Видеоплатформы' },
      { patterns: [/подкаст|аудио/i], name: 'Подкастинг' },
      { patterns: [/блог|стать|издани/i], name: 'Контент-платформы' },
    ],
    marketContext: 'Media в трансформации. Ключевое - retention, engagement.',
    typicalFeatures: ['Контент', 'Подписка', 'Рекомендации', 'Комментарии'],
    metrics: ['Pageviews', 'Time on site', 'Subscribers', 'Churn'],
    competitors: ['Яндекс.Дзен', 'VC.ru', 'The Village'],
  },
  'EventTech': {
    patterns: [/(events?|мероприят|конференц|встреч|билет.*событи|афиш|регистрац.*мероприят|zoom|webinar)/i],
    subIndustries: [
      { patterns: [/конференц|форум|съезд/i], name: 'B2B мероприятия' },
      { patterns: [/вебинар|online.*event|zoom/i], name: 'Онлайн-мероприятия' },
      { patterns: [/билет|регистрац.*билет/i], name: 'Билетные системы' },
    ],
    marketContext: 'EventTech гибридный после COVID. Ключевое - интерактивность.',
    typicalFeatures: ['Регистрация', 'Программа', 'Нетворкинг', 'Трансляция'],
    metrics: ['Registrations', 'Attendance Rate', 'Engagement', 'NPS'],
    competitors: ['Eventbrite', 'Timepad'],
  },
  'SocialTech': {
    patterns: [/(social|социальн|сообществ|чат|мессендж|общение|друз|знакомств|dating)/i],
    subIndustries: [
      { patterns: [/мессендж|чат.*прилож/i], name: 'Мессенджеры' },
      { patterns: [/сообществ|форум|групп/i], name: 'Сообщества' },
      { patterns: [/знакомств|dating/i], name: 'Дейтинг' },
    ],
    marketContext: 'Социальные продукты выигрывают на сетевом эффекте.',
    typicalFeatures: ['Профиль', 'Лента', 'Подписки', 'Чат'],
    metrics: ['DAU/MAU', 'Time spent', 'Viral coefficient', 'Retention'],
    competitors: ['Telegram', 'VK', 'Badoo'],
  },
  'SportTech': {
    patterns: [/(sport|спорт|фитнес|трениров|упражнен|зож|здоровый образ|зал|тренер|йог)/i],
    subIndustries: [
      { patterns: [/фитнес|зал|тренер/i], name: 'Фитнес-приложения' },
      { patterns: [/трениров|план.*трениров/i], name: 'Тренировочные платформы' },
      { patterns: [/йог|медитац/i], name: 'Wellness' },
    ],
    marketContext: 'SportTech растет на волне ЗОЖ. Ключевое - gamification.',
    typicalFeatures: ['Тренировки', 'Трекер', 'Прогресс', 'Сообщество'],
    metrics: ['Active users', 'Workouts completed', 'Retention'],
    competitors: ['Strava', 'Nike Training Club'],
  },
  'AutoTech': {
    patterns: [/(auto|авто|маши[на]|водител|такси|каршеринг|парков|карта.*дорог|навигац)/i],
    subIndustries: [
      { patterns: [/такси|агрегатор.*такс/i], name: 'Такси' },
      { patterns: [/каршеринг|совместн.*использован.*авто/i], name: 'Carsharing' },
      { patterns: [/навигац|маршрут|дорог/i], name: 'Навигация' },
    ],
    marketContext: 'AutoTech трансформируется с электромобилями.',
    typicalFeatures: ['Карта', 'Бронирование', 'Оплата', 'Отслеживание'],
    metrics: ['Rides', 'Revenue per ride', 'Fleet utilization'],
    competitors: ['Яндекс.Такси', 'Делимобиль'],
  },
  'BeautyTech': {
    patterns: [/(beauty|красот|космет|салон|парикмах|услуг.*красот|макияж|бров|ногот)/i],
    subIndustries: [
      { patterns: [/салон|парикмах|услуг/i], name: 'Салоны красоты' },
      { patterns: [/запис.*салон|онлайн.*запис/i], name: 'Системы записи' },
      { patterns: [/космет|продаж.*космет/i], name: 'Косметика e-commerce' },
    ],
    marketContext: 'BeautyTech растет. Ключевое - визуальный контент.',
    typicalFeatures: ['Запись', 'Каталог', 'Фото', 'Отзывы'],
    metrics: ['Bookings', 'No-show rate', 'Retention'],
    competitors: ['YClients', 'Dikidi'],
  },
  'LegalTech': {
    patterns: [/(legaltech|юрист|прав|договор|документ|нотари|закон|юрид|суд|иск|адвокат)/i],
    subIndustries: [
      { patterns: [/договор|контракт|шаблон/i], name: 'Управление договорами' },
      { patterns: [/эдо|электронн.*подпис/i], name: 'Электронный документооборот' },
      { patterns: [/суд|иск|арбитраж/i], name: 'Судебная автоматизация' },
    ],
    marketContext: 'LegalTech нишевый, но растущий. Консервативные клиенты.',
    typicalFeatures: ['Шаблоны', 'Электронная подпись', 'Хранение'],
    metrics: ['Documents processed', 'Time saved', 'Compliance rate'],
    competitors: ['Doczilla', 'Pravo Tech'],
  },
};

/**
 * MAIN EXTRACTION FUNCTION
 * Returns ONLY data actually found in text
 */
export function extractIdeaFromText(sourceText: string): ExtractedIdea {
  const log: string[] = [];
  log.push(`[v9.0] Начало анализа, длина текста: ${sourceText.length}`);
  
  const fullText = sourceText.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  const lowerText = fullText.toLowerCase();
  
  // === 1. IDENTIFY INDUSTRY ===
  const { industry, subIndustry, marketContext } = identifyIndustryDeep(fullText, lowerText, log);
  
  // === 2. EXTRACT PRODUCT NAME - PRECISE ===
  const name = extractProductNamePrecise(fullText, lowerText, log);
  
  // === 3. EXTRACT DESCRIPTION - PRECISE ===
  const description = extractDescriptionPrecise(fullText, lowerText, name, log);
  
  // === 4. EXTRACT FUNCTIONAL REQUIREMENTS ===
  const functionalRequirements = extractFunctionalRequirementsPrecise(fullText, lowerText, industry, log);
  
  // === 5. EXTRACT FUNCTIONS ===
  const functions = extractFunctionsPrecise(fullText, lowerText, functionalRequirements, log);
  
  // === 6. EXTRACT TARGET AUDIENCE ===
  const userTypes = extractTargetAudiencePrecise(fullText, lowerText, log);
  
  // === 7. EXTRACT VALUE PROPOSITION ===
  const valueProposition = extractValuePropositionPrecise(fullText, lowerText, log);
  
  // === 8. EXTRACT RISKS ===
  const risks = extractRisksPrecise(fullText, lowerText, log);
  
  // === 9. EXTRACT DIFFICULTIES ===
  const difficulties = extractDifficultiesPrecise(fullText, lowerText, log);
  
  // === 10. EXTRACT USE CASES ===
  const useCases = extractUseCasesPrecise(fullText, lowerText, functions, log);
  
  // === 11. EXTRACT USER STORIES ===
  const userStories = extractUserStoriesPrecise(fullText, lowerText, userTypes, functions, description, log);
  
  // === 12. EXTRACT JTBD ===
  const jtbd = extractJTBDPrecise(fullText, lowerText, name, description, functions, log);
  
  // === 13. GENERATE HYPOTHESES ===
  const hypotheses = generateHypotheses(functions, userTypes, valueProposition, industry, functionalRequirements, log);
  
  // === 14. GENERATE INSIGHTS ===
  const poInsights = generateInsights(industry, subIndustry, functions, userTypes, valueProposition, functionalRequirements, log);
  
  // === 15. DEFINE MVP SCOPE ===
  const mvpScope = defineMVPScope(functionalRequirements, functions, valueProposition, log);

  const industryData = INDUSTRY_DATABASE[industry];
  
  log.push(`[v9.0] Анализ завершен`);
  
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

/**
 * PRECISE PRODUCT NAME EXTRACTION
 */
function extractProductNamePrecise(fullText: string, lowerText: string, log: string[]): string {
  log.push('[Name] Поиск названия продукта...');
  
  // Pattern 1: Quoted name «Name» or "Name" - ищем первое упоминание в кавычках
  const quotedMatches = fullText.matchAll(/[«"]([А-Яа-яA-Za-z0-9\s\-]{2,40})[»"]/g);
  for (const match of quotedMatches) {
    const candidate = match[1].trim();
    // Пропускаем общие слова
    if (!isGenericPhrase(candidate) && candidate.length > 2) {
      log.push(`[Name] Найдено в кавычках: "${candidate}"`);
      return candidate;
    }
  }
  
  // Pattern 2: "продукт/сервис/платформа/приложение X называется"
  const namedPatterns = [
    /(?:продукт|сервис|платформа|приложение|проект|система)\s+([А-Яа-яA-Za-z0-9\s\-]{2,35})\s+(?:называется|это|будет)/i,
    /(?:называется|название)\s*[«"]?([А-Яа-яA-Za-z0-9\s\-]{2,35})[»"]?(?:\s|$|\.|,)/i,
    /(?:созда[ёю]м|разрабатываем|делаем|пишем)\s+([А-Яа-яA-Za-z0-9\s\-]{3,35})(?:\s|,|\.)/i,
  ];
  
  for (const pattern of namedPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const candidate = match[1].trim();
      if (!isGenericPhrase(candidate) && candidate.length > 2) {
        log.push(`[Name] Найдено по паттерну: "${candidate}"`);
        return candidate;
      }
    }
  }
  
  // Pattern 3: "X — это ..." в начале текста
  const definitionMatch = fullText.match(/^([А-Я][а-яёA-Za-z0-9\s\-]{2,30})\s*(?:—|–|-)?\s*это\s+/m);
  if (definitionMatch) {
    const candidate = definitionMatch[1].trim();
    if (!isGenericPhrase(candidate) && candidate.length > 2) {
      log.push(`[Name] Найдено в определении: "${candidate}"`);
      return candidate;
    }
  }
  
  // Pattern 4: Look for capitalized unique word that appears multiple times
  const capWords = fullText.match(/(?<![а-яa-z])([А-ЯA-Z][а-яa-zA-Z]{2,20})(?![а-яa-z])/g);
  if (capWords) {
    const wordCounts = new Map<string, number>();
    for (const word of capWords) {
      if (!isGenericPhrase(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
    // Find word that appears more than once
    for (const [word, count] of wordCounts) {
      if (count >= 2) {
        log.push(`[Name] Найдено часто встречающееся слово: "${word}" (${count} раз)`);
        return word;
      }
    }
    // Or take the first non-generic capitalized word
    for (const word of capWords) {
      if (!isGenericPhrase(word) && word.length > 3) {
        log.push(`[Name] Найдено капитализированное слово: "${word}"`);
        return word;
      }
    }
  }
  
  // Pattern 5: Dialog format "Name: ..." - extract speaker name that appears first
  const dialogMatch = fullText.match(/^([А-Я][а-я]+):\s*[а-яё]/m);
  if (dialogMatch) {
    // Check if this is a product name in context
    const context = fullText.substring(0, 200);
    if (/идея|продукт|прилож|сервис|платформ/i.test(context)) {
      // Look for actual product name in the first few lines
      const firstLines = fullText.split('\n').slice(0, 5).join('\n');
      const quotedInFirst = firstLines.match(/[«"]([^»"]{2,30})[»"]/);
      if (quotedInFirst) {
        log.push(`[Name] Найдено в начале диалога: "${quotedInFirst[1]}"`);
        return quotedInFirst[1];
      }
    }
  }
  
  log.push('[Name] Название не найдено в тексте');
  return ''; // Возвращаем пустую строку, а не заглушку
}

/**
 * PRECISE DESCRIPTION EXTRACTION
 */
function extractDescriptionPrecise(fullText: string, lowerText: string, name: string, log: string[]): string {
  log.push('[Description] Поиск описания продукта...');
  
  // Pattern 1: "X — это ..."
  if (name) {
    const escapedName = escapeRegex(name);
    const thisMatch = fullText.match(new RegExp(`${escapedName}\\s*(?:—|–|-)?\\s*это\\s+([^.\\n]{30,350})`, 'i'));
    if (thisMatch) {
      log.push(`[Description] Найдено определение через "это"`);
      return cleanDescription(thisMatch[1].trim());
    }
  }
  
  // Pattern 2: "представляет собой" / "является"
  const representsMatch = fullText.match(/(?:представляет собой|является)\s+([^.\\n]{30,300})/i);
  if (representsMatch) {
    log.push(`[Description] Найдено описание через "представляет собой"`);
    return cleanDescription(representsMatch[1].trim());
  }
  
  // Pattern 3: "миссия/цель/задача — ..."
  const missionMatch = fullText.match(/(?:миссия|цель|задача)[а-яё]*\s*(?:—|–|-|:)?\s*([^.\\n]{30,250})/i);
  if (missionMatch) {
    log.push(`[Description] Найдено через миссию/цель`);
    return cleanDescription(missionMatch[1].trim());
  }
  
  // Pattern 4: "мы создаём/разрабатываем"
  const createMatch = fullText.match(/(?:мы\s+)?(?:созда[ёю]м|разрабатываем|делаем|строим|запускаем|пишем)\s+([^.\\n]{30,280})/i);
  if (createMatch) {
    log.push(`[Description] Найдено через "создаём/разрабатываем"`);
    return cleanDescription(createMatch[1].trim());
  }
  
  // Pattern 5: "суть в том" / "основная идея"
  const essenceMatch = fullText.match(/(?:суть в том|основная идея|главное)[,—:]?\s*([^.\\n]{30,250})/i);
  if (essenceMatch) {
    log.push(`[Description] Найдено через "суть/идея"`);
    return cleanDescription(essenceMatch[1].trim());
  }
  
  // Pattern 6: First meaningful paragraph (not dialog lines)
  const lines = fullText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip dialog lines, headers, short lines
    if (trimmed.length > 50 && 
        !/^[А-Я][а-я]+:/.test(trimmed) && 
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('-') &&
        !trimmed.startsWith('—')) {
      log.push(`[Description] Найдено в первом значимом абзаце`);
      return cleanDescription(trimmed.substring(0, 350));
    }
  }
  
  log.push('[Description] Описание не найдено в тексте');
  return ''; // Возвращаем пустую строку
}

/**
 * Clean description text
 */
function cleanDescription(text: string): string {
  return text
    .replace(/^(?:—|–|-|:)+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * PRECISE FUNCTIONAL REQUIREMENTS EXTRACTION
 */
function extractFunctionalRequirementsPrecise(
  fullText: string,
  lowerText: string,
  industry: string,
  log: string[]
): { feature: string; description: string; priority: string; source: string; details: string[] }[] {
  log.push('[FR] Извлечение функциональных требований...');
  const requirements: { feature: string; description: string; priority: string; source: string; details: string[] }[] = [];
  const seen = new Set<string>();
  
  // Speech patterns for feature extraction
  const patterns = [
    // Explicit feature mentions
    { regex: /(?:функци[яи]|возможность|инструмент|модуль|раздел)[:—]?\s*([А-Яа-яA-Za-z0-9\s\-]{5,60})/gi, priority: 'Should Have' },
    // User actions
    { regex: /(?:пользовател[иь]|клиент|заказчик)\s+(?:должен|может|сможет)\s+([а-яёa-z0-9\s\-]{10,80})/gi, priority: 'Must Have' },
    // Wants and needs
    { regex: /(?:хотелось бы|хочу|нужно|надо|необходимо)\s+(?:чтобы\s+)?(?:был[аои]?\s+)?([а-яёa-z0-9\s\-]{8,70})/gi, priority: 'Should Have' },
    // Problems to solve
    { regex: /(?:проблема|сложность|затруднен)[а-яё]*\s+(?:в том,?\s+)?(?:что\s+)?([а-яёa-z0-9\s\-]{10,80})/gi, priority: 'High' },
    // Gap analysis
    { regex: /(?:не хватает|отсутствует|нет)\s+(?:возможности\s+)?([а-яёa-z0-9\s\-]{5,70})/gi, priority: 'Should Have' },
    // Business requirements
    { regex: /(?:для\s+)?(?:монетизац|заработк|выручк|прибыл)[а-яё]*\s+(?:нужно\s+)?([а-яёa-z0-9\s\-]{5,70})/gi, priority: 'Must Have' },
    // System capabilities
    { regex: /(?:система|платформа|приложение|сервис)\s+(?:должн[ао]?\s+|умеет\s+|позволяет\s+)([а-яёa-z0-9\s\-]{8,80})/gi, priority: 'Should Have' },
  ];
  
  for (const { regex, priority } of patterns) {
    const matches = fullText.matchAll(regex);
    for (const match of matches) {
      let feature = match[1]?.trim();
      if (!feature || feature.length < 5) continue;
      
      // Clean feature name
      feature = feature
        .replace(/^(чтобы|что|как|был[аои]?|сделать|добавить|создать|реализовать)\s+/i, '')
        .replace(/\s+(в системе|в приложении|на платформе)$/i, '')
        .trim();
      
      const key = feature.toLowerCase().substring(0, 30);
      if (seen.has(key) || isGenericPhrase(feature)) continue;
      seen.add(key);
      
      // Capitalize first letter
      feature = feature.charAt(0).toUpperCase() + feature.slice(1);
      
      requirements.push({
        feature,
        description: `Извлечено из текста: "${feature.toLowerCase()}"`,
        priority,
        source: `💬 "${match[0].substring(0, 60)}${match[0].length > 60 ? '...' : ''}"`,
        details: [],
      });
    }
  }
  
  // Extract from bulleted/numbered lists
  const listPatterns = [
    /(?:функции|возможности|инструменты|функционал|что\s+умеет)[^:]*[:—]?\s*([\s\S]*?)(?=\n\n|\n#|целевая|аудитория|риски|$)/gi,
  ];
  
  for (const pattern of listPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const items = match[0].match(/(?:—|-|•|\*)?\s*\d*[.)]?\s*([А-Яа-яA-Za-z][^\n]{5,80})/g);
      if (items) {
        for (const item of items) {
          const cleaned = item.replace(/^(?:—|-|•|\*|\d|\.|\)|\s)+/, '').trim();
          const key = cleaned.toLowerCase().substring(0, 30);
          if (cleaned.length > 5 && cleaned.length < 80 && !seen.has(key) && !isGenericPhrase(cleaned)) {
            seen.add(key);
            requirements.push({
              feature: cleaned,
              description: `Указано в списке функций`,
              priority: 'Should Have',
              source: `📋 "${cleaned}"`,
              details: [],
            });
          }
        }
      }
    }
  }
  
  // Extract from bulleted lists
  const bulletItems = fullText.matchAll(/(?:^|\n)\s*(?:—|-|•|\*)\s+([А-Яа-яA-Za-z][^\n]{5,70})/g);
  for (const match of bulletItems) {
    const cleaned = match[1].trim();
    const key = cleaned.toLowerCase().substring(0, 30);
    if (cleaned.length > 5 && cleaned.length < 70 && !seen.has(key) && !isGenericPhrase(cleaned)) {
      seen.add(key);
      requirements.push({
        feature: cleaned,
        description: `Извлечено из списка`,
        priority: 'Could Have',
        source: `📋 "${cleaned}"`,
        details: [],
      });
    }
  }
  
  log.push(`[FR] Найдено ${requirements.length} требований`);
  return requirements.slice(0, 12);
}

/**
 * PRECISE FUNCTIONS EXTRACTION
 */
function extractFunctionsPrecise(
  fullText: string,
  lowerText: string,
  functionalRequirements: { feature: string }[],
  log: string[]
): string[] {
  log.push('[Functions] Извлечение функций...');
  const functions: string[] = [];
  const seen = new Set<string>();
  
  // First add from functional requirements
  for (const req of functionalRequirements) {
    const key = req.feature.toLowerCase().substring(0, 25);
    if (!seen.has(key)) {
      seen.add(key);
      functions.push(req.feature);
    }
  }
  
  // Pattern: Section with functions
  const sectionMatch = fullText.match(/(?:функции|возможности|инструменты|функционал)[^:]*[:—]?\s*([\s\S]*?)(?=\n\n|\n#|целевая|аудитория|риски|$)/i);
  if (sectionMatch) {
    const items = sectionMatch[0].match(/(?:—|-|•|\*)?\s*\d*[.)]?\s*([А-Яа-яA-Za-z][^\n]{5,80})/g);
    if (items) {
      for (const item of items) {
        const cleaned = item.replace(/^(?:—|-|•|\*|\d|\.|\)|\s)+/, '').trim();
        const key = cleaned.toLowerCase().substring(0, 25);
        if (cleaned.length > 5 && cleaned.length < 80 && !seen.has(key) && !isGenericPhrase(cleaned)) {
          seen.add(key);
          functions.push(cleaned);
        }
      }
    }
  }
  
  log.push(`[Functions] Найдено ${functions.length} функций`);
  return functions.slice(0, 10);
}

/**
 * PRECISE TARGET AUDIENCE EXTRACTION
 */
function extractTargetAudiencePrecise(fullText: string, lowerText: string, log: string[]): string {
  log.push('[Audience] Поиск целевой аудитории...');
  
  // Pattern 1: "аудитория/для кого" section
  const audSection = fullText.match(/(?:аудитори[яи]|для кого|целевая.*аудитори[яи]|пользовател[иь]|клиент[^а-я])[а-яё]*[^:]*[:—]?\s*([\s\S]*?)(?=\n\n|\n#|риски|функции|возможности|монетиз|$)/i);
  if (audSection) {
    const text = audSection[1].trim();
    if (text.length > 10 && !isGenericPhrase(text)) {
      log.push(`[Audience] Найдено в разделе аудитории`);
      return text.substring(0, 500);
    }
  }
  
  // Pattern 2: "для X" mentions
  const forMatches = fullText.matchAll(/для\s+([а-яёa-z\s]{5,50})(?:\s|,|\.)/gi);
  const audiences: string[] = [];
  for (const match of forMatches) {
    const audience = match[1].trim();
    if (audience.length > 4 && !isGenericPhrase(audience) && !audiences.some(a => a.includes(audience.substring(0, 15)))) {
      audiences.push(audience);
    }
  }
  if (audiences.length > 0) {
    log.push(`[Audience] Найдено ${audiences.length} сегментов`);
    return audiences.slice(0, 5).join('\n');
  }
  
  log.push('[Audience] Аудитория не найдена');
  return '';
}

/**
 * PRECISE VALUE PROPOSITION EXTRACTION
 */
function extractValuePropositionPrecise(fullText: string, lowerText: string, log: string[]): string {
  log.push('[Value] Поиск ценностного предложения...');
  
  const patterns = [
    /(?:преимущество|ценность|фишка|особенность|отличие|killer\s*feature)[^:]*[:—]?\s*([^.\\n]{15,180})/i,
    /(?:в отличие от|лучше чем|быстрее чем|удобнее чем|проще чем)[^.\\n]{10,130}/i,
    /(?:экономит|сокращает|уменьшает|увеличивает|улучшает|упрощает)\s+[^.\\n]{10,110}/i,
    /(?:решаем проблему|помогаем|даем возможность|позволяет)[^.\\n]{15,110}/i,
    /(?:наше преимущество|наша фишка|наша особенность)[:—]?\s*([^.\\n]{15,150})/i,
  ];
  
  for (const pattern of patterns) {
    const match = fullText.match(pattern);
    if (match) {
      const value = match[0].trim().substring(0, 180);
      if (!isGenericPhrase(value)) {
        log.push(`[Value] Найдено ценностное предложение`);
        return value;
      }
    }
  }
  
  log.push('[Value] Ценность не найдена');
  return '';
}

/**
 * PRECISE RISKS EXTRACTION
 */
function extractRisksPrecise(fullText: string, lowerText: string, log: string[]): string[] {
  log.push('[Risks] Поиск рисков...');
  const risks: string[] = [];
  
  const patterns = [
    /риск[а-яё]*[^.\\n]{8,120}/gi,
    /(?:проблема|сложность|трудность|угроза|опасность)[а-яё]*[^.\\n]{8,110}/gi,
    /(?:может не|рискованно|опасно|не получится|есть вероятность)[^.\\n]{8,100}/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const risk = match[0].trim().substring(0, 120);
      if (!risks.some(r => r.includes(risk.substring(0, 25))) && !isGenericPhrase(risk)) {
        risks.push(risk);
      }
    }
  }
  
  log.push(`[Risks] Найдено ${risks.length} рисков`);
  return risks.slice(0, 5);
}

/**
 * PRECISE DIFFICULTIES EXTRACTION
 */
function extractDifficultiesPrecise(fullText: string, lowerText: string, log: string[]): string[] {
  log.push('[Difficulties] Поиск трудностей...');
  const difficulties: string[] = [];
  
  const patterns = [
    /(?:стоит|цена|бюджет|стоимость|ресурс)[а-яё]*[^.\\n]{8,110}/gi,
    /(?:сложно|трудно|долго|дорого|ресурсоемко|затратно)[а-яё]*[^.\\n]{8,100}/gi,
    /(?:ограничен|не хватает|недостаточно|дефицит)[а-яё]*[^.\\n]{8,100}/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const diff = match[0].trim().substring(0, 100);
      if (!difficulties.some(d => d.includes(diff.substring(0, 25))) && !isGenericPhrase(diff)) {
        difficulties.push(diff);
      }
    }
  }
  
  log.push(`[Difficulties] Найдено ${difficulties.length} трудностей`);
  return difficulties.slice(0, 5);
}

/**
 * PRECISE USE CASES EXTRACTION
 */
function extractUseCasesPrecise(fullText: string, lowerText: string, functions: string[], log: string[]): string[] {
  log.push('[UseCases] Поиск сценариев использования...');
  const useCases: string[] = [];
  
  // "когда" scenarios
  const whenMatch = fullText.matchAll(/(?:когда|если|в случае)\s+([а-яёa-z0-9\s\-]{10,70})/gi);
  for (const match of whenMatch) {
    if (useCases.length < 5) {
      useCases.push(match[0].trim());
    }
  }
  
  log.push(`[UseCases] Найдено ${useCases.length} сценариев`);
  return useCases;
}

/**
 * PRECISE USER STORIES EXTRACTION
 */
function extractUserStoriesPrecise(
  fullText: string,
  lowerText: string,
  userTypes: string,
  functions: string[],
  description: string,
  log: string[]
): { role: string; want: string; benefit: string; source: string; acceptanceCriteria: string[] }[] {
  log.push('[UserStories] Формирование пользовательских историй...');
  const userStories: { role: string; want: string; benefit: string; source: string; acceptanceCriteria: string[] }[] = [];
  
  const roles = userTypes.split('\n').filter(r => r.trim().length > 3);
  const primaryRole = roles[0]?.substring(0, 50) || 'Пользователь';
  
  // "хочу/нужно" patterns
  const wantMatches = fullText.matchAll(/(?:хочу|нужно|хотелось бы|необходимо)\s+([а-яёa-z0-9\s\-]{10,70})/gi);
  for (const match of wantMatches) {
    if (userStories.length < 5) {
      const want = match[1].trim();
      if (!isGenericPhrase(want) && !userStories.some(us => us.want.includes(want.substring(0, 20)))) {
        userStories.push({
          role: primaryRole,
          want: want,
          benefit: description ? description.substring(0, 50) : 'достичь цели',
          source: `💬 "${match[0].substring(0, 50)}..."`,
          acceptanceCriteria: [],
        });
      }
    }
  }
  
  // Generate from functions if needed
  if (userStories.length < 2 && functions.length > 0) {
    for (const func of functions.slice(0, 2)) {
      userStories.push({
        role: primaryRole,
        want: func.toLowerCase(),
        benefit: description ? description.substring(0, 40) : 'решить задачу',
        source: `📝 На основе функции`,
        acceptanceCriteria: [],
      });
    }
  }
  
  log.push(`[UserStories] Сформировано ${userStories.length} историй`);
  return userStories;
}

/**
 * PRECISE JTBD EXTRACTION
 */
function extractJTBDPrecise(
  fullText: string,
  lowerText: string,
  name: string,
  description: string,
  functions: string[],
  log: string[]
): { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[] {
  log.push('[JTBD] Формирование Jobs To Be Done...');
  const jtbd: { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[] = [];
  
  const whenMatches = fullText.matchAll(/(?:когда|каждый раз когда)\s+([а-яёa-z0-9\s\-]{10,60})/gi);
  for (const match of whenMatches) {
    if (jtbd.length < 4) {
      jtbd.push({
        situation: match[1].trim(),
        motivation: name ? `использовать ${name}` : 'найти решение',
        outcome: description ? description.substring(0, 40) : 'достичь цели',
        source: `💬 "${match[0].substring(0, 50)}..."`,
        emotionalContext: 'Извлечено из контекста',
      });
    }
  }
  
  log.push(`[JTBD] Сформировано ${jtbd.length} JTBD`);
  return jtbd;
}

/**
 * IDENTIFY INDUSTRY DEEP
 */
function identifyIndustryDeep(fullText: string, lowerText: string, log: string[]): { industry: string; subIndustry: string; marketContext: string } {
  log.push('[Industry] Определение отрасли...');
  
  const scores = new Map<string, number>();
  const subIndustryScores = new Map<string, { industry: string; subIndustry: string; score: number }>();
  
  for (const [industryName, data] of Object.entries(INDUSTRY_DATABASE)) {
    for (const pattern of data.patterns) {
      const matches = fullText.match(pattern);
      if (matches) {
        scores.set(industryName, (scores.get(industryName) || 0) + matches.length * 2);
      }
    }
    
    for (const subInd of data.subIndustries) {
      for (const pattern of subInd.patterns) {
        const matches = fullText.match(pattern);
        if (matches) {
          const key = `${industryName}:${subInd.name}`;
          subIndustryScores.set(key, {
            industry: industryName,
            subIndustry: subInd.name,
            score: (subIndustryScores.get(key)?.score || 0) + matches.length * 3,
          });
          scores.set(industryName, (scores.get(industryName) || 0) + matches.length);
        }
      }
    }
  }
  
  let maxScore = 0;
  let bestIndustry = 'SaaS/B2B';
  
  for (const [industry, score] of scores) {
    if (score > maxScore) {
      maxScore = score;
      bestIndustry = industry;
    }
  }
  
  let bestSubIndustry = '';
  let maxSubScore = 0;
  
  for (const [key, data] of subIndustryScores) {
    if (data.industry === bestIndustry && data.score > maxSubScore) {
      maxSubScore = data.score;
      bestSubIndustry = data.subIndustry;
    }
  }
  
  const industryData = INDUSTRY_DATABASE[bestIndustry];
  
  log.push(`[Industry] Определена отрасль: ${bestIndustry}${bestSubIndustry ? ` → ${bestSubIndustry}` : ''}`);
  
  return {
    industry: bestIndustry,
    subIndustry: bestSubIndustry,
    marketContext: industryData?.marketContext || '',
  };
}

/**
 * GENERATE HYPOTHESES
 */
function generateHypotheses(
  functions: string[],
  userTypes: string,
  valueProposition: string,
  industry: string,
  functionalRequirements: { feature: string; priority: string }[],
  log: string[]
): { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[] {
  log.push('[Hypotheses] Генерация гипотез...');
  const hypotheses: { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[] = [];
  
  if (valueProposition) {
    hypotheses.push({
      hypothesis: `Ценностное предложение резонирует с аудиторией`,
      type: 'Ценность',
      validation: 'Custdev интервью, A/B тест landing page',
      priority: 'High',
      rationale: 'Ценностное предложение - основа product-market fit',
    });
  }
  
  for (const req of functionalRequirements.slice(0, 3)) {
    hypotheses.push({
      hypothesis: `Функция "${req.feature}" критична для пользователей`,
      type: 'Решение',
      validation: 'MVP тест, метрики использования',
      priority: req.priority === 'Must Have' ? 'High' : 'Medium',
      rationale: 'Требует валидации перед включением в MVP',
    });
  }
  
  if (userTypes) {
    hypotheses.push({
      hypothesis: `Целевая аудитория готова платить за решение`,
      type: 'Рынок',
      validation: 'WTP-опросы, анализ конкурентов',
      priority: 'High',
      rationale: 'Willingness to pay критична для бизнес-модели',
    });
  }
  
  hypotheses.push({
    hypothesis: `${industry} рынок готов к внедрению решения`,
    type: 'Рынок',
    validation: 'TAM/SAM/SOM анализ, тренды индустрии',
    priority: 'Medium',
    rationale: 'Тайминг рынка - ключевой фактор успеха',
  });
  
  log.push(`[Hypotheses] Сформировано ${hypotheses.length} гипотез`);
  return hypotheses.slice(0, 6);
}

/**
 * GENERATE INSIGHTS
 */
function generateInsights(
  industry: string,
  subIndustry: string,
  functions: string[],
  userTypes: string,
  valueProposition: string,
  functionalRequirements: { feature: string; priority: string }[],
  log: string[]
): { insight: string; recommendation: string; impact: string }[] {
  log.push('[Insights] Генерация рекомендаций...');
  const insights: { insight: string; recommendation: string; impact: string }[] = [];
  
  const mustHave = functionalRequirements.filter(r => r.priority === 'Must Have');
  insights.push({
    insight: `MVP должен включать ${mustHave.length > 0 ? mustHave.length : 'минимальный'} набор критичных функций`,
    recommendation: `Scope MVP: ${mustHave.length > 0 ? mustHave.map(r => r.feature).slice(0, 3).join(', ') : functions[0] || 'базовый функционал'}`,
    impact: 'Сокращение time-to-market',
  });
  
  if (!userTypes) {
    insights.push({
      insight: 'Целевая аудитория не определена в тексте',
      recommendation: 'Провести custdev интервью, создать персоны',
      impact: 'Повышение конверсии за счет точного понимания ЦА',
    });
  }
  
  if (!valueProposition) {
    insights.push({
      insight: 'Ценностное предложение не сформулировано в тексте',
      recommendation: 'Сформулировать UVP и протестировать',
      impact: 'Повышение конверсии на landing page',
    });
  }
  
  log.push(`[Insights] Сформировано ${insights.length} рекомендаций`);
  return insights;
}

/**
 * DEFINE MVP SCOPE
 */
function defineMVPScope(
  functionalRequirements: { feature: string; priority: string }[],
  functions: string[],
  valueProposition: string,
  log: string[]
): { feature: string; reason: string; effort: string }[] {
  log.push('[MVP] Определение scope MVP...');
  const mvpScope: { feature: string; reason: string; effort: string }[] = [];
  
  const mustHave = functionalRequirements.filter(r => r.priority === 'Must Have');
  for (const req of mustHave.slice(0, 4)) {
    mvpScope.push({
      feature: req.feature,
      reason: 'Критично для базового сценария',
      effort: 'Medium',
    });
  }
  
  if (mvpScope.length < 3 && functions.length > 0) {
    for (const func of functions.slice(0, 3 - mvpScope.length)) {
      if (!mvpScope.some(m => m.feature.toLowerCase().includes(func.toLowerCase().substring(0, 15)))) {
        mvpScope.push({
          feature: func,
          reason: 'Основная функциональность',
          effort: 'Medium',
        });
      }
    }
  }
  
  log.push(`[MVP] Определено ${mvpScope.length} функций для MVP`);
  return mvpScope;
}

/**
 * HELPER: Check if phrase is generic/empty
 */
function isGenericPhrase(phrase: string): boolean {
  const generic = [
    'это', 'как', 'что', 'для', 'при', 'над', 'под', 'можно', 'нужно', 'надо',
    'тоже', 'ещё', 'уже', 'или', 'но', 'а', 'и', 'в', 'на', 'с', 'к', 'по', 'из', 'за', 'то', 'не', 'да', 'нет',
    'продукт', 'сервис', 'платформа', 'приложение', 'система', 'проект',
    'функция', 'возможность', 'инструмент', 'модуль',
    'пользователь', 'клиент', 'человек', 'люди',
    'данный', 'этот', 'тот', 'такой', 'какой', 'который',
    'будет', 'есть', 'был', 'была', 'были', 'было',
    'мочь', 'может', 'могут', 'должен', 'должна',
    'описание продукта', 'из предоставленного текста', 'не указан', 'не найден',
    'требуется уточнение', 'через custdev', 'извлечь из контекста не удалось',
  ];
  
  const lowerPhrase = phrase.toLowerCase().trim();
  
  // Check if phrase is in generic list
  if (generic.includes(lowerPhrase)) return true;
  
  // Check if phrase is too short
  if (lowerPhrase.length < 3) return true;
  
  // Check if phrase consists mostly of generic words
  const words = lowerPhrase.split(/\s+/);
  const genericCount = words.filter(w => generic.includes(w)).length;
  if (words.length > 0 && genericCount / words.length > 0.7) return true;
  
  return false;
}

/**
 * HELPER: Escape regex
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * FORMAT IDEA AS MARKDOWN
 */
export function formatIdeaAsMarkdown(idea: ExtractedIdea): string {
  const hasName = idea.name && idea.name.length > 0;
  const hasDescription = idea.description && idea.description.length > 0;
  const hasFunctions = idea.functions.length > 0;
  const hasAudience = idea.userTypes && idea.userTypes.length > 0;
  const hasValue = idea.valueProposition && idea.valueProposition.length > 0;
  
  // Format functional requirements
  const funcReqText = idea.functionalRequirements.length > 0
    ? idea.functionalRequirements.map((r, i) => `### FR-${i + 1}: ${r.feature}
**Приоритет:** ${r.priority}
*${r.source}*`).join('\n\n')
    : '*Функциональные требования не найдены в тексте*';
  
  // Format user stories
  const userStoriesText = idea.userStories.length > 0
    ? idea.userStories.map((us, i) => `### US-${i + 1}
Как **${us.role}**, я хочу **${us.want}**, чтобы ${us.benefit}.

*${us.source}*`).join('\n\n')
    : '*Пользовательские истории не сформированы (недостаточно данных в тексте)*';
  
  // Format JTBD
  const jtbdText = idea.jtbd.length > 0
    ? idea.jtbd.map((j, i) => `### JTBD-${i + 1}

**📋 Ситуация:** ${j.situation}
**🎯 Мотивация:** ${j.motivation}
**✅ Результат:** чтобы ${j.outcome}

*${j.source}*`).join('\n\n')
    : '*JTBD не сформированы (недостаточно данных в тексте)*';
  
  // Format hypotheses
  const hypothesesText = idea.hypotheses.map((h, i) => `### H-${i + 1}: ${h.type}
**Гипотеза:** ${h.hypothesis}
**Валидация:** ${h.validation}
**Приоритет:** ${h.priority}`).join('\n\n');

  // Format insights
  const insightsText = idea.poInsights.map((ins, i) => `### 💡 Insight ${i + 1}
**Наблюдение:** ${ins.insight}
**Рекомендация:** ${ins.recommendation}
**Влияние:** ${ins.impact}`).join('\n\n');

  // Format MVP scope
  const mvpText = idea.mvpScope.length > 0
    ? idea.mvpScope.map((m, i) => `${i + 1}. **${m.feature}** (${m.effort}) — ${m.reason}`).join('\n')
    : '*MVP scope не определен (недостаточно данных)*';

  return `═══════════════════════════════════════════════════════════════
# 💡 ИДЕЯ ПРОДУКТА
═══════════════════════════════════════════════════════════════

## 🎯 Название

${hasName ? `**${idea.name}**` : '*Название не найдено в тексте*'}

---

### 📝 Описание

${hasDescription ? idea.description : '*Описание не найдено в тексте*'}

---

### 🏢 Отрасль

**${idea.industry}**${idea.subIndustry ? ` → ${idea.subIndustry}` : ''}

${idea.industryContext || ''}

═══════════════════════════════════════════════════════════════

## 👥 Целевая аудитория

${hasAudience ? idea.userTypes : '*Не указана в тексте*'}

---

### ⚡ Ключевая ценность

${hasValue ? idea.valueProposition : '*Не сформулирована в тексте*'}

═══════════════════════════════════════════════════════════════

## 📋 Функциональные требования

${funcReqText}

═══════════════════════════════════════════════════════════════

## 🛠️ Основные функции

${hasFunctions 
  ? idea.functions.map((f, i) => `${i + 1}. ${f}`).join('\n')
  : '*Функции не найдены в тексте*'}

═══════════════════════════════════════════════════════════════

## 📖 User Stories

${userStoriesText}

═══════════════════════════════════════════════════════════════

## 🎯 Jobs To Be Done

${jtbdText}

═══════════════════════════════════════════════════════════════

## 📋 Use Cases

${idea.useCases.length > 0 
  ? idea.useCases.map((u, i) => `**UC-${i + 1}** → ${u}`).join('\n\n')
  : '*Сценарии не найдены в тексте*'}

═══════════════════════════════════════════════════════════════

## 🧪 Гипотезы для валидации

${hypothesesText}

═══════════════════════════════════════════════════════════════

## 🎯 MVP Scope

${mvpText}

═══════════════════════════════════════════════════════════════

## 💡 Рекомендации

${insightsText}

═══════════════════════════════════════════════════════════════

## ⚠️ Риски

${idea.risks.length > 0 
  ? idea.risks.map((r, i) => `${i + 1}. ${r}`).join('\n')
  : '*Риски не указаны в тексте*'}

---

## 🔧 Трудности

${idea.difficulties.length > 0 
  ? idea.difficulties.map((d, i) => `${i + 1}. ${d}`).join('\n')
  : '*Трудности не указаны в тексте*'}

---

**Извлечено Product Owner Agent v9.0**
*Все данные извлечены из предоставленного текста*`;
}
