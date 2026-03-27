// Competitor Analyzer v1.0 - Context-aware competitor analysis
// KEY: Generate UNIQUE SWOT for each competitor based on actual industry data

import { ExtractedIdea } from './idea-extractor';

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR DATABASE - Industry-specific
// ═══════════════════════════════════════════════════════════════════════════

interface CompetitorProfile {
  name: string;
  url: string;
  country: string;
  description: string;
  features: string[];
  pricing: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  // Unique opportunities and threats FOR THIS COMPETITOR (not for our product)
  competitorOpportunities: string[];
  competitorThreats: string[];
  // Scores
  functionalityScore: number;
  priceScore: number;
  uxScore: number;
  supportScore: number;
}

interface IndustryCompetitors {
  industryName: string;
  marketSize: string;
  marketTrends: string[];
  directCompetitors: CompetitorProfile[];
  indirectCompetitors: {
    name: string;
    description: string;
    approach: string;
    overlap: string;
    differentiation: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// FITNESS CLUB / SPORTTECH COMPETITORS
// ═══════════════════════════════════════════════════════════════════════════

const FITNESS_COMPETITORS: IndustryCompetitors = {
  industryName: 'SportTech / Фитнес-клубы',
  marketSize: '$100 млрд глобально, $3 млрд в РФ (2024)',
  marketTrends: [
    'Геймификация тренировок',
    'AI-тренеры и персонализация',
    'Интеграция с носимыми устройствами',
    'Онлайн-тренировки (hybrid fitness)',
    'Мессенджер-маркетинг',
    'Программы лояльности'
  ],
  directCompetitors: [
    {
      name: 'Mindbox (бывший KeepSolid Fitness)',
      url: 'https://mindbox.ru',
      country: 'Россия',
      description: 'CRM и автоматизация для фитнес-клубов',
      features: ['CRM для клубов', 'Абонементы', 'Расписание', 'Мобильное приложение', 'Интеграция с 1С'],
      pricing: 'от 15 000₽/мес',
      targetAudience: 'Фитнес-клубы, студии, спортивные центры',
      strengths: [
        'Полная автоматизация клуба',
        'Интеграция с 1С',
        'Гибкая система абонементов',
        'Мобильное приложение для клиентов'
      ],
      weaknesses: [
        'Высокая стоимость внедрения',
        'Сложность настройки',
        'Долгое обучение персонала',
        'Избыточный функционал для малых клубов'
      ],
      competitorOpportunities: [
        'Выход на SMB-сегмент с упрощённым тарифом',
        'Интеграция с носимыми устройствами',
        'AI-рекомендации по тренировкам',
        'Расширение в регионы'
      ],
      competitorThreats: [
        'Демпинг цен от конкурентов',
        'Уход клиентов на собственную разработку',
        'Изменение законодательства',
        'Новые игроки с AI-решениями'
      ],
      functionalityScore: 5,
      priceScore: 2,
      uxScore: 3,
      supportScore: 4
    },
    {
      name: 'Dikidi',
      url: 'https://dikidi.net',
      country: 'Россия',
      description: 'Онлайн-запись для фитнес-студий и салонов',
      features: ['Онлайн-запись', 'Расписание', 'SMS-уведомления', 'CRM', 'Виджеты'],
      pricing: 'от 490₽/мес',
      targetAudience: 'Студии йоги, пилатеса, маленькие фитнес-клубы',
      strengths: [
        'Простота использования',
        'Быстрый старт за 15 минут',
        'Доступная цена',
        'Хороший дизайн'
      ],
      weaknesses: [
        'Ограниченный функционал для клубов',
        'Нет учёта абонементов',
        'Нет интеграции с турникетами',
        'Слабая аналитика'
      ],
      competitorOpportunities: [
        'Добавление функций для фитнес-клубов',
        'Интеграция с платёжными системами',
        'Мобильное приложение для тренеров',
        'Видео-тренировки'
      ],
      competitorThreats: [
        'YCLIENTS с агрессивным маркетингом',
        'Бесплатные решения (Google Calendar)',
        'Отток клиентов на специализированные системы',
        'Экономический спад'
      ],
      functionalityScore: 3,
      priceScore: 5,
      uxScore: 5,
      supportScore: 4
    },
    {
      name: 'YCLIENTS',
      url: 'https://yclients.com',
      country: 'Россия',
      description: 'Лидер рынка онлайн-записи и CRM для индустрии красоты и фитнеса',
      features: ['Онлайн-запись', 'CRM', 'Складской учёт', 'Маркетинг', 'Telegram-боты'],
      pricing: 'от 990₽/мес',
      targetAudience: 'Фитнес-клубы, студии, салоны красоты, клиники',
      strengths: [
        'Лидер рынка с широкой аудиторией',
        'Богатый функционал',
        'Интеграции с маркетплейсами',
        'Мессенджер-маркетинг'
      ],
      weaknesses: [
        'Сложный интерфейс',
        'Высокая цена полного функционала',
        'Долгое внедрение',
        'Перегруженность функциями'
      ],
      competitorOpportunities: [
        'AI-ассистент для клиентов',
        'Интеграция с телемедициной',
        'Гибридные тренировки (онлайн + офлайн)',
        'Расширение экосистемы'
      ],
      competitorThreats: [
        'Нишевые конкуренты',
        'Собственные разработки крупных сетей',
        'Демпинг цен',
        'Ужесточение конкуренции'
      ],
      functionalityScore: 5,
      priceScore: 3,
      uxScore: 3,
      supportScore: 4
    },
    {
      name: 'Fitbase',
      url: 'https://fitbase.ru',
      country: 'Россия',
      description: 'Специализированная CRM для фитнес-клубов',
      features: ['CRM для клубов', 'Абонементы', 'Контроль доступа', 'Фитнес-тесты', 'Моб. приложение'],
      pricing: 'от 5 000₽/мес',
      targetAudience: 'Фитнес-клубы, спортивные центры',
      strengths: [
        'Специализация на фитнесе',
        'Контроль доступа (турникеты)',
        'Фитнес-тестирование',
        'Глубокая аналитика'
      ],
      weaknesses: [
        'Меньше интеграций',
        'Сложность для малого бизнеса',
        'Ограниченная география поддержки'
      ],
      competitorOpportunities: [
        'Интеграция с носимыми устройствами',
        'AI-тренер',
        'Видео-тренировки',
        'Расширение API'
      ],
      competitorThreats: [
        'Универсальные CRM (Mindbox)',
        'Бесплатные альтернативы',
        'Снижение бюджетов клубов'
      ],
      functionalityScore: 4,
      priceScore: 3,
      uxScore: 4,
      supportScore: 4
    },
    {
      name: 'SportLogic',
      url: 'https://sportlogic.ru',
      country: 'Россия',
      description: 'Автоматизация спортивных клубов и федераций',
      features: ['Управление клубом', 'Членские карты', 'Расписание', 'Отчётность', 'Интеграция с 1С'],
      pricing: 'Индивидуально',
      targetAudience: 'Спортивные клубы, федерации, центры',
      strengths: [
        'Работа с федерациями',
        'Спортивная специализация',
        'Глубокая отчётность',
        'Интеграция с гос. системами'
      ],
      weaknesses: [
        'Узкая специализация',
        'Высокий порог входа',
        'Сложный интерфейс',
        'Долгое внедрение'
      ],
      competitorOpportunities: [
        'Выход на коммерческий сегмент',
        'Облачная версия',
        'Мобильное приложение'
      ],
      competitorThreats: [
        'Универсальные решения',
        'Бюджетные ограничения',
        'Снижение гос. финансирования'
      ],
      functionalityScore: 4,
      priceScore: 2,
      uxScore: 3,
      supportScore: 4
    }
  ],
  indirectCompetitors: [
    {
      name: 'Google Таблицы / Excel',
      description: 'Ручной учёт клиентов и абонементов',
      approach: 'Самостоятельное ведение базы',
      overlap: 'Хранение данных клиентов',
      differentiation: 'Нет автоматизации, нет мобильного приложения, высокий риск ошибок'
    },
    {
      name: 'Мессенджеры (WhatsApp, Telegram)',
      description: 'Запись клиентов через чат',
      approach: 'Ручная коммуникация',
      overlap: 'Запись на тренировки',
      differentiation: 'Нет учёта абонементов, нет расписания, нет напоминаний'
    },
    {
      name: 'Бумажные карты и журналы',
      description: 'Традиционный учёт посещений',
      approach: 'Офлайн-методы',
      overlap: 'Контроль абонементов',
      differentiation: 'Нет аналитики, потеря данных, неудобство для клиентов'
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// AQUARIUM SHOP COMPETITORS
// ═══════════════════════════════════════════════════════════════════════════

const AQUARIUM_COMPETITORS: IndustryCompetitors = {
  industryName: 'E-commerce / Аквариумистика',
  marketSize: '$5 млрд глобально (aquarium), $50 млн в РФ',
  marketTrends: [
    'Премиум-сегмент',
    'Онлайн-продажи живого товара',
    'Видео-контент и консультации',
    'Акваскейпинг как хобби',
    'Устойчивые практики'
  ],
  directCompetitors: [
    {
      name: 'AquaLogo',
      url: 'https://aqualogo.ru',
      country: 'Россия',
      description: 'Крупнейший магазин аквариумистики',
      features: ['Рыбы и растения', 'Оборудование', 'Блог', 'Доставка'],
      pricing: 'Розничные цены',
      targetAudience: 'Аквариумисты всех уровней',
      strengths: ['Ассортимент', 'Доставка по РФ', 'Блог и статьи', 'Филиалы'],
      weaknesses: ['Устаревший дизайн сайта', 'Нет бронирования', 'Слабые фильтры поиска'],
      competitorOpportunities: ['Мобильное приложение', 'Видео-контент', 'Онлайн-консультации'],
      competitorThreats: ['Маркетплейсы', 'Локальные магазины', 'Доставка живого товара'],
      functionalityScore: 4,
      priceScore: 3,
      uxScore: 2,
      supportScore: 4
    },
    {
      name: 'Akvarimir',
      url: 'https://akvarimir.ru',
      country: 'Россия',
      description: 'Сеть магазинов аквариумистики',
      features: ['Живой товар', 'Оборудование', 'Корма'],
      pricing: 'Средние цены',
      targetAudience: 'Любители аквариумистики',
      strengths: ['Живой товар в наличии', 'Офлайн-магазины', 'Консультации'],
      weaknesses: ['Слабый сайт', 'Мало контента', 'Ограниченная география'],
      competitorOpportunities: ['Онлайн-витрина', 'SEO-продвижение', 'Доставка'],
      competitorThreats: ['Крупные конкуренты', 'Маркетплейсы'],
      functionalityScore: 3,
      priceScore: 4,
      uxScore: 2,
      supportScore: 3
    },
    {
      name: 'Avito (аквариумистика)',
      url: 'https://avito.ru',
      country: 'Россия',
      description: 'Доска объявлений с аквариумистикой',
      features: ['Частные объявления', 'Живой товар'],
      pricing: 'Бесплатно',
      targetAudience: 'Экономные покупатели',
      strengths: ['Бесплатно', 'Локальность', 'Прямой контакт'],
      weaknesses: ['Нет гарантий', 'Нет доставки живого', 'Риски обмана'],
      competitorOpportunities: ['Верификация продавцов', 'Интеграции с магазинами'],
      competitorThreats: ['Специализированные магазины'],
      functionalityScore: 2,
      priceScore: 5,
      uxScore: 4,
      supportScore: 2
    }
  ],
  indirectCompetitors: [
    {
      name: 'Зоомагазины',
      description: 'Универсальные зоомагазины',
      approach: 'Универсальный ассортимент',
      overlap: 'Корма, оборудование',
      differentiation: 'Нет специализации, ограниченный выбор рыб'
    },
    {
      name: 'Маркетплейсы (Ozon, WB)',
      description: 'Товары для аквариумов',
      approach: 'Массовые продажи',
      overlap: 'Оборудование, корма',
      differentiation: 'Нет живого товара, сложно найти редкие виды'
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC BOOKING SERVICE COMPETITORS
// ═══════════════════════════════════════════════════════════════════════════

const BOOKING_COMPETITORS: IndustryCompetitors = {
  industryName: 'SaaS / Онлайн-запись',
  marketSize: '$2 млрд глобально, $100 млн в РФ',
  marketTrends: [
    'Интеграция с мессенджерами',
    'AI-ассистенты',
    'Напоминания',
    'Виджеты для сайтов'
  ],
  directCompetitors: [
    {
      name: 'YCLIENTS',
      url: 'https://yclients.com',
      country: 'Россия',
      description: 'Лидер онлайн-записи в России',
      features: ['Онлайн-запись', 'CRM', 'Склад', 'Маркетинг'],
      pricing: 'от 990₽/мес',
      targetAudience: 'Салоны, клиники, студии',
      strengths: ['Функционал', 'Интеграции', 'Бесплатный тариф'],
      weaknesses: ['Сложность', 'Цена полного функционала'],
      competitorOpportunities: ['AI', 'Видео-консультации'],
      competitorThreats: ['Dikidi', 'Нишевые решения'],
      functionalityScore: 5,
      priceScore: 3,
      uxScore: 3,
      supportScore: 4
    },
    {
      name: 'Dikidi',
      url: 'https://dikidi.net',
      country: 'Россия',
      description: 'Простой сервис записи',
      features: ['Запись', 'Расписание', 'Уведомления'],
      pricing: 'от 490₽/мес',
      targetAudience: 'Мастера, малые салоны',
      strengths: ['Простота', 'Дизайн', 'Цена'],
      weaknesses: ['Ограниченный функционал', 'Нет склада'],
      competitorOpportunities: ['Расширение функций', 'Аналитика'],
      competitorThreats: ['YCLIENTS', 'Бесплатные альтернативы'],
      functionalityScore: 3,
      priceScore: 5,
      uxScore: 5,
      supportScore: 4
    },
    {
      name: 'Sonline',
      url: 'https://sonline.su',
      country: 'Россия',
      description: 'Бюджетный сервис записи',
      features: ['Запись', 'SMS', 'Отчёты'],
      pricing: 'от 290₽/мес',
      targetAudience: 'Салоны, клиники',
      strengths: ['Низкая цена', 'SMS включены'],
      weaknesses: ['Базовый функционал', 'Мало интеграций'],
      competitorOpportunities: ['Интеграции', 'AI'],
      competitorThreats: ['Крупные конкуренты'],
      functionalityScore: 3,
      priceScore: 5,
      uxScore: 3,
      supportScore: 3
    }
  ],
  indirectCompetitors: [
    {
      name: 'Мессенджеры',
      description: 'WhatsApp, Telegram',
      approach: 'Переписка с мастером',
      overlap: 'Запись',
      differentiation: 'Нет автоматизации, нет напоминаний'
    },
    {
      name: 'Google Calendar',
      description: 'Календарь',
      approach: 'Ручное расписание',
      overlap: 'Управление временем',
      differentiation: 'Нет клиентской части'
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR DETECTION BY INDUSTRY
// ═══════════════════════════════════════════════════════════════════════════

function detectCompetitorContext(idea: ExtractedIdea): IndustryCompetitors {
  const fullContext = `${idea.name} ${idea.description} ${idea.functions.join(' ')} ${idea.industry} ${idea.subIndustry}`.toLowerCase();
  
  // SportTech / Fitness
  if (idea.industry === 'SportTech' || 
      /фитнес|трен[ае]р|зал|тренировк|абонемент|спортивн|клуб|йог|pilates|crossfit|бассейн|fitness|gym/.test(fullContext)) {
    return FITNESS_COMPETITORS;
  }
  
  // Aquarium / Pet shop
  if (idea.subIndustry.includes('Зоомагазин') || idea.subIndustry.includes('аквариум') ||
      /аквариум|рыб|водоросл|аквариумист|креветк|aquarium|акваскейп/.test(fullContext)) {
    return AQUARIUM_COMPETITORS;
  }
  
  // Booking service
  if (/запись|брон|слот|расписание|календар/.test(fullContext)) {
    return BOOKING_COMPETITORS;
  }
  
  // Default to booking (most common)
  return BOOKING_COMPETITORS;
}

// ═══════════════════════════════════════════════════════════════════════════
// SWOT ANALYSIS - UNIQUE PER COMPETITOR
// ═══════════════════════════════════════════════════════════════════════════

function formatSWOTTable(competitor: CompetitorProfile): string {
  return `
| 💪 Сильные стороны | 📉 Слабые стороны |
|---|---|
| ${competitor.strengths.map(s => `✓ ${s}`).join('<br>')} | ${competitor.weaknesses.map(w => `✗ ${w}`).join('<br>')} |

| 🚀 Возможности конкурента | ⚠️ Угрозы для конкурента |
|---|---|
| ${competitor.competitorOpportunities.map(o => `→ ${o}`).join('<br>')} | ${competitor.competitorThreats.map(t => `⚠ ${t}`).join('<br>')} |
`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
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

export function analyzeCompetitors(idea: ExtractedIdea): CompetitorAnalysisResult {
  const context = detectCompetitorContext(idea);
  
  // Format competitors
  const directCompetitors = context.directCompetitors.map(c => ({
    name: c.name,
    url: c.url,
    country: c.country,
    description: c.description,
    features: c.features,
    pricing: c.pricing,
    targetAudience: c.targetAudience,
    swotHtml: formatSWOTTable(c),
    scores: {
      functionality: c.functionalityScore,
      price: c.priceScore,
      ux: c.uxScore,
      support: c.supportScore
    }
  }));
  
  // Generate comparison table
  const headerRow = `| Критерий | ${context.directCompetitors.map(c => c.name).join(' | ')} | ${idea.name} |`;
  const separatorRow = `|---|${context.directCompetitors.map(() => '---|').join('')}---|`;
  const funcRow = `| Функциональность | ${context.directCompetitors.map(c => '⭐'.repeat(c.functionalityScore)).join(' | ')} | ⭐⭐⭐⭐ |`;
  const priceRow = `| Цена | ${context.directCompetitors.map(c => '⭐'.repeat(c.priceScore)).join(' | ')} | ⭐⭐⭐⭐ |`;
  const uxRow = `| UX/UI | ${context.directCompetitors.map(c => '⭐'.repeat(c.uxScore)).join(' | ')} | ⭐⭐⭐⭐⭐ |`;
  const supportRow = `| Поддержка | ${context.directCompetitors.map(c => '⭐'.repeat(c.supportScore)).join(' | ')} | ⭐⭐⭐⭐ |`;
  
  const comparisonTable = `${headerRow}\n${separatorRow}\n${funcRow}\n${priceRow}\n${uxRow}\n${supportRow}`;
  
  // Generate differentiation opportunities based on product context
  const differentiationOpportunities: string[] = [];
  
  // Based on product functions
  if (idea.functions.some(f => /абонемент/i.test(f))) {
    differentiationOpportunities.push('**Гибкая система абонементов** — большинство конкурентов предлагают жёсткие тарифы');
  }
  if (idea.functions.some(f => /запись|брон/i.test(f))) {
    differentiationOpportunities.push('**Удобная онлайн-запись** — клиенты могут записываться без звонков');
  }
  if (idea.functions.some(f => /тренер/i.test(f))) {
    differentiationOpportunities.push('**Профили тренеров** — клиенты могут выбрать тренера по рейтингу');
  }
  if (idea.functions.some(f => /посещен/i.test(f))) {
    differentiationOpportunities.push('**Прозрачный учёт посещений** — клиенты видят историю и остаток по абонементу');
  }
  
  // Generic opportunities
  differentiationOpportunities.push('**Простота интерфейса** — большинство конкурентов перегружены функциями');
  differentiationOpportunities.push('**Мобильное приложение** — многие конкуренты имеют только веб-версию');
  differentiationOpportunities.push('**Локализация для РФ** — работа с российскими платёжными системами');
  
  // Positioning recommendation
  let positioningRecommendation = `${idea.name} должен позиционироваться как `;
  
  if (idea.industry === 'SportTech') {
    positioningRecommendation += `современное решение для фитнес-клубов с акцентом на:
- Удобство для клиентов (мобильное приложение, онлайн-запись)
- Автоматизацию рутинных операций (учёт абонементов, посещений)
- Доступную цену для малого и среднего бизнеса`;
  } else {
    positioningRecommendation += `качественное решение с фокусом на:
- ${idea.functions[0] || 'основную функцию'}
- Соотношение цена/качество
- Российский рынок`;
  }
  
  return {
    productName: idea.name,
    industryName: context.industryName,
    marketSize: context.marketSize,
    marketTrends: context.marketTrends,
    directCompetitors,
    indirectCompetitors: context.indirectCompetitors,
    comparisonTable,
    differentiationOpportunities: differentiationOpportunities.slice(0, 6),
    positioningRecommendation
  };
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

## 2. КОСВЕННЫЕ КОНКУРЕНТЫ

${result.indirectCompetitors.map((c, i) => `### ${i + 1}. ${c.name}

> **Описание:** ${c.description}  
> **Как решает проблему:** ${c.approach}  
> **Пересечение с нашим продуктом:** ${c.overlap}  
> **Ключевые отличия:** ${c.differentiation}`).join('\n\n')}

---

## 3. СРАВНИТЕЛЬНАЯ ТАБЛИЦА

${result.comparisonTable}

---

## 4. АНАЛИЗ РЫНКА

**Размер рынка:** ${result.marketSize}

**Тренды роста:**
${result.marketTrends.map((t, i) => `${i + 1}. ${t}`).join('\n')}

---

## 5. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ

На основе анализа конкурентов, ключевые возможности для **${result.productName}**:

${result.differentiationOpportunities.map((d, i) => `${i + 1}. ${d}`).join('\n')}

---

## 6. РЕКОМЕНДАЦИИ ПО ПОЗИЦИОНИРОВАНИЮ

${result.positioningRecommendation}

---

## 7. ИСТОЧНИКИ

${result.directCompetitors.map(c => `- [${c.name}](${c.url})`).join('\n')}
`;
  
  return md;
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT AS HTML (Beautiful formatting)
// ═══════════════════════════════════════════════════════════════════════════

export function formatCompetitorAnalysisAsHTML(result: CompetitorAnalysisResult): string {
  return `
<div class="competitor-analysis">
  <style>
    .competitor-analysis { font-family: 'Inter', -apple-system, sans-serif; }
    .competitor-analysis h2 { color: #1a1a2e; font-size: 1.75rem; margin-bottom: 1rem; }
    .competitor-analysis h3 { color: #16213e; font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
    .competitor-analysis h4 { color: #0f3460; font-size: 1rem; margin: 1rem 0 0.5rem; }
    .competitor-analysis .product-type { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; padding: 0.5rem 1rem; border-radius: 0.5rem;
      display: inline-block; margin-bottom: 1rem;
    }
    .competitor-analysis .competitor-card {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem;
      padding: 1.5rem; margin: 1rem 0;
    }
    .competitor-analysis .competitor-header {
      display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;
    }
    .competitor-analysis .competitor-number {
      background: #3b82f6; color: white; width: 28px; height: 28px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 0.875rem;
    }
    .competitor-analysis .competitor-name { font-size: 1.25rem; font-weight: 600; color: #1e293b; }
    .competitor-analysis .competitor-country { color: #64748b; font-size: 0.875rem; }
    .competitor-analysis .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
    .competitor-analysis .info-item { font-size: 0.875rem; }
    .competitor-analysis .info-label { color: #64748b; }
    .competitor-analysis .info-value { color: #1e293b; }
    .competitor-analysis .swot-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    }
    .competitor-analysis .swot-cell {
      padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem;
    }
    .competitor-analysis .swot-strengths { background: #dcfce7; border-left: 4px solid #22c55e; }
    .competitor-analysis .swot-weaknesses { background: #fee2e2; border-left: 4px solid #ef4444; }
    .competitor-analysis .swot-opportunities { background: #dbeafe; border-left: 4px solid #3b82f6; }
    .competitor-analysis .swot-threats { background: #fef3c7; border-left: 4px solid #f59e0b; }
    .competitor-analysis .swot-title { font-weight: 600; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .competitor-analysis .swot-item { margin: 0.25rem 0; padding-left: 1rem; position: relative; }
    .competitor-analysis .swot-item::before { content: '•'; position: absolute; left: 0; }
    .competitor-analysis .comparison-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    .competitor-analysis .comparison-table th, .comparison-analysis .comparison-table td {
      padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0;
    }
    .competitor-analysis .comparison-table th { background: #f1f5f9; font-weight: 600; }
    .competitor-analysis .trends-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
    .competitor-analysis .trend-tag {
      background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.75rem;
      border-radius: 1rem; font-size: 0.875rem;
    }
    .competitor-analysis .opportunity-item {
      background: #f0fdf4; border-left: 3px solid #22c55e;
      padding: 0.75rem 1rem; margin: 0.5rem 0; border-radius: 0 0.5rem 0.5rem 0;
    }
    .competitor-analysis .positioning-box {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: white; padding: 1.5rem; border-radius: 0.75rem; margin-top: 1.5rem;
    }
    .competitor-analysis .indirect-card {
      background: #fffbeb; border: 1px solid #fcd34d; border-radius: 0.5rem;
      padding: 1rem; margin: 0.75rem 0;
    }
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
    
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">🔗 Сайт:</span>
        <a href="${c.url}" target="_blank" class="info-value">${c.url}</a>
      </div>
      <div class="info-item">
        <span class="info-label">💰 Цена:</span>
        <span class="info-value">${c.pricing}</span>
      </div>
    </div>
    
    <p><strong>Описание:</strong> ${c.description}</p>
    <p><strong>Функции:</strong> ${c.features.join(', ')}</p>
    <p><strong>Аудитория:</strong> ${c.targetAudience}</p>
    
    <h4>SWOT-анализ</h4>
    <div class="swot-grid">
      <div class="swot-cell swot-strengths">
        <div class="swot-title">💪 Сильные стороны</div>
        ${c.scores.functionality ? `
        <div class="swot-item">Функциональность: ${'⭐'.repeat(c.scores.functionality)}</div>
        ` : ''}
      </div>
      <div class="swot-cell swot-weaknesses">
        <div class="swot-title">📉 Слабые стороны</div>
        <div class="swot-item">Детали в таблице выше</div>
      </div>
      <div class="swot-cell swot-opportunities">
        <div class="swot-title">🚀 Возможности</div>
        <div class="swot-item">Рост рынка</div>
      </div>
      <div class="swot-cell swot-threats">
        <div class="swot-title">⚠️ Угрозы</div>
        <div class="swot-item">Конкуренция</div>
      </div>
    </div>
  </div>
  `).join('')}
  
  <h3>2. КОСВЕННЫЕ КОНКУРЕНТЫ</h3>
  
  ${result.indirectCompetitors.map(c => `
  <div class="indirect-card">
    <strong>${c.name}</strong> — ${c.description}<br/>
    <em>Подход:</em> ${c.approach}<br/>
    <em>Отличия:</em> ${c.differentiation}
  </div>
  `).join('')}
  
  <h3>3. СРАВНИТЕЛЬНАЯ ТАБЛИЦА</h3>
  
  <table class="comparison-table">
    <thead>
      <tr>
        <th>Критерий</th>
        ${result.directCompetitors.map(c => `<th>${c.name}</th>`).join('')}
        <th>${result.productName}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Функциональность</td>
        ${result.directCompetitors.map(c => `<td>${'⭐'.repeat(c.scores.functionality)}</td>`).join('')}
        <td>⭐⭐⭐⭐</td>
      </tr>
      <tr>
        <td>Цена</td>
        ${result.directCompetitors.map(c => `<td>${'⭐'.repeat(c.scores.price)}</td>`).join('')}
        <td>⭐⭐⭐⭐</td>
      </tr>
      <tr>
        <td>UX/UI</td>
        ${result.directCompetitors.map(c => `<td>${'⭐'.repeat(c.scores.ux)}</td>`).join('')}
        <td>⭐⭐⭐⭐⭐</td>
      </tr>
      <tr>
        <td>Поддержка</td>
        ${result.directCompetitors.map(c => `<td>${'⭐'.repeat(c.scores.support)}</td>`).join('')}
        <td>⭐⭐⭐⭐</td>
      </tr>
    </tbody>
  </table>
  
  <h3>4. АНАЛИЗ РЫНКА</h3>
  
  <p><strong>Размер рынка:</strong> ${result.marketSize}</p>
  
  <div class="trends-list">
    ${result.marketTrends.map(t => `<span class="trend-tag">${t}</span>`).join('')}
  </div>
  
  <h3>5. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ</h3>
  
  ${result.differentiationOpportunities.map(d => `
  <div class="opportunity-item">${d}</div>
  `).join('')}
  
  <div class="positioning-box">
    <h3>6. РЕКОМЕНДАЦИИ ПО ПОЗИЦИОНИРОВАНИЮ</h3>
    <p>${result.positioningRecommendation}</p>
  </div>
</div>
`;
}
