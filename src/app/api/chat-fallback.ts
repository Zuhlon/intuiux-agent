// Fallback ответы при недоступности AI - Smart extraction from transcription
import {
  extractIdeaFromTranscription,
  extractIdeaFromMarkdown,
  formatIdeaAsMarkdown,
  generateIAFromIdea,
  type AgentContext
} from '@/lib/agent-context';

// Types
interface Idea {
  name: string;
  description: string;
  functions: string[];
  useCases: string[];
  userTypes: string;
  valueProposition: string;
  risks: string[];
  difficulties: string[];
}

interface SourceAnalysis {
  name: string;
  description: string;
  functions: string[];
  useCases: string[];
  userTypes: string;
  valueProposition: string;
  risks: string[];
  difficulties: string[];
  valueImprovements: string[];
  differentiationStrategy: string;
  finalScore: string;
}

interface Competitor {
  name: string;
  url: string;
  description: string;
  features: string;
  pricing: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  functionalityScore: string;
  priceScore: string;
  uxScore: string;
  supportScore: string;
  country?: string;
}

interface IndirectCompetitor {
  name: string;
  description: string;
  approach: string;
  overlap: string;
  differentiation: string;
}

interface ProductType {
  id: string;
  name: string;
  keywords: string[];
  marketSize: string;
  trends: string[];
  barriers: string[];
  positioning: string;
}

// Inline product type detection
function detectProductTypeInline(text: string): ProductType {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('магазин') || lowerText.includes('товар') || lowerText.includes('ecommerce') || lowerText.includes('маркетплейс')) {
    return {
      id: 'ecommerce',
      name: 'E-commerce / Интернет-магазин',
      keywords: ['магазин', 'товар', 'заказ', 'доставка'],
      marketSize: '$6 трлн глобально',
      trends: ['Маркетплейсы', 'Social commerce', 'Персонализация'],
      barriers: ['Логистика', 'Конкуренция'],
      positioning: 'современная платформа электронной коммерции'
    };
  }
  
  if (lowerText.includes('медиа') || lowerText.includes('блог') || lowerText.includes('стать') || lowerText.includes('контент') || lowerText.includes('публикац')) {
    return {
      id: 'blog',
      name: 'Медиа / Блог',
      keywords: ['статьи', 'контент', 'читатели', 'подписчики'],
      marketSize: '$400 млрд глобально',
      trends: ['Подписочные модели', 'Короткий контент', 'Интерактивность'],
      barriers: ['Привлечение аудитории', 'Монетизация'],
      positioning: 'медиа-платформа с практическим фокусом'
    };
  }
  
  if (lowerText.includes('запис') || lowerText.includes('брон') || lowerText.includes('слот')) {
    return {
      id: 'booking',
      name: 'Онлайн-запись',
      keywords: ['запись', 'бронирование', 'слот'],
      marketSize: '$10 млрд',
      trends: ['Автоматизация', 'Интеграции'],
      barriers: ['Конкуренция', 'Привычки'],
      positioning: 'сервис онлайн-записи'
    };
  }
  
  if (lowerText.includes('приложен') || lowerText.includes('мобильн') || lowerText.includes('app')) {
    return {
      id: 'app',
      name: 'Мобильное приложение',
      keywords: ['приложение', 'мобильный', 'смартфон'],
      marketSize: '$200 млрд',
      trends: ['AI-функции', 'Super apps', 'Персонализация'],
      barriers: ['Привлечение пользователей', 'Retention'],
      positioning: 'мобильное приложение'
    };
  }
  
  return {
    id: 'saas',
    name: 'SaaS / Сервис',
    keywords: ['сервис', 'платформа', 'инструмент'],
    marketSize: '$300 млрд',
    trends: ['AI-интеграции', 'No-code', 'Персонализация'],
    barriers: ['Конкуренция', 'Churn'],
    positioning: 'современный SaaS-продукт'
  };
}

// Generate competitors based on product type
function generateCompetitors(productType: ProductType, idea: Idea) {
  const competitorsMap: Record<string, { direct: Competitor[]; indirect: IndirectCompetitor[] }> = {
    blog: {
      direct: [
        {
          name: 'vc.ru',
          url: 'https://vc.ru',
          description: 'Крупнейшая платформа о бизнесе и технологиях в России',
          features: 'Статьи, комментарии, рейтинсы, рейтинги компаний',
          pricing: 'Бесплатно + премиум',
          targetAudience: 'Предприниматели, инвесторы, IT-специалисты',
          strengths: ['Огромная аудитория', 'Активное комьюнити', 'SEO-позиции'],
          weaknesses: ['Много рекламы', 'Низкое качество части контента', 'Шум в ленте'],
          opportunities: ['Нишевые продукты', 'Качество > количество', 'Интерактивы'],
          threats: ['Рост конкуренции', 'Усталость аудитории'],
          functionalityScore: '8/10',
          priceScore: '9/10',
          uxScore: '6/10',
          supportScore: '7/10',
          country: 'Россия'
        },
        {
          name: 'РБК',
          url: 'https://rbc.ru',
          description: 'Ведущий деловой медиа-ресурс России',
          features: 'Новости, аналитика, котировки',
          pricing: 'Бесплатно + подписка',
          targetAudience: 'Бизнес-аудитория, финансисты',
          strengths: ['Авторитет', 'Качество', 'Охват'],
          weaknesses: ['Формальность', 'Мало практических советов', 'Сложный язык'],
          opportunities: ['Практический контент', 'Молодёжная аудитория'],
          threats: ['Цензура', 'Отток к Telegram'],
          functionalityScore: '9/10',
          priceScore: '8/10',
          uxScore: '7/10',
          supportScore: '8/10',
          country: 'Россия'
        },
        {
          name: 'Forbes Russia',
          url: 'https://forbes.ru',
          description: 'Российское издание Forbes',
          features: 'Рейтинги, интервью, аналитика',
          pricing: 'Бесплатно + премиум',
          targetAudience: 'Топ-менеджмент, инвесторы',
          strengths: ['Престиж', 'Качественные интервью', 'Рейтинги'],
          weaknesses: ['Фокус на крупный бизнес', 'Мало для стартапов', 'Редкие публикации'],
          opportunities: ['Средний бизнес', 'Startups'],
          threats: ['Конкуренция с vc.ru'],
          functionalityScore: '8/10',
          priceScore: '7/10',
          uxScore: '8/10',
          supportScore: '7/10',
          country: 'Россия'
        }
      ],
      indirect: [
        {
          name: 'Telegram-каналы',
          description: 'Авторские каналы предпринимателей',
          approach: 'Личный бренд автора, неформальный стиль',
          overlap: 'Целевая аудитория',
          differentiation: 'Системный подход, инструменты, база знаний'
        },
        {
          name: 'YouTube',
          description: 'Видео-контент о бизнесе',
          approach: 'Видео-формат, визуализация',
          overlap: 'Контент о бизнесе',
          differentiation: 'Текстовый формат глубже, плюс инструменты'
        }
      ]
    },
    ecommerce: {
      direct: [
        {
          name: 'Wildberries',
          url: 'https://wildberries.ru',
          description: 'Крупнейший маркетплейс России',
          features: 'Маркетплейс, логистика, реклама',
          pricing: 'Комиссия 5-15%',
          targetAudience: 'Все категории',
          strengths: ['Охват', 'Логистика', ' Узнаваемость'],
          weaknesses: ['Жёсткие условия', 'Сложный интерфейс продавца', 'Высокая конкуренция'],
          opportunities: ['Нишевые магазины', 'Уникальный товар'],
          threats: ['Доминирование на рынке'],
          functionalityScore: '9/10',
          priceScore: '7/10',
          uxScore: '7/10',
          supportScore: '6/10',
          country: 'Россия'
        },
        {
          name: 'Ozon',
          url: 'https://ozon.ru',
          description: 'Второй крупнейший маркетплейс',
          features: 'Маркетплейс, логистика, фулфилмент',
          pricing: 'Комиссия 5-20%',
          targetAudience: 'Все категории',
          strengths: ['Технологичность', 'Условия для продавцов', 'Рекламные инструменты'],
          weaknesses: ['Меньший охват WB', 'Сложность'],
          opportunities: ['Новые категории'],
          threats: ['Конкуренция с WB'],
          functionalityScore: '9/10',
          priceScore: '7/10',
          uxScore: '8/10',
          supportScore: '7/10',
          country: 'Россия'
        }
      ],
      indirect: [
        {
          name: 'Instagram Shops',
          description: 'Социальная коммерция',
          approach: 'Визуальный контент + покупки',
          overlap: 'Молодая аудитория',
          differentiation: 'Полноценный магазин'
        }
      ]
    },
    saas: {
      direct: [
        {
          name: 'Competitor A',
          url: 'https://competitor-a.com',
          description: 'Лидер рынка',
          features: 'Полный функционал',
          pricing: 'От $50/мес',
          targetAudience: 'Enterprise',
          strengths: ['Бренд', 'Функционал', 'Интеграции'],
          weaknesses: ['Цена', 'Сложность', 'Поддержка'],
          opportunities: ['SMB сегмент', 'Простота'],
          threats: ['Новые игроки'],
          functionalityScore: '9/10',
          priceScore: '5/10',
          uxScore: '6/10',
          supportScore: '7/10'
        }
      ],
      indirect: [
        {
          name: 'Excel/Google Sheets',
          description: 'Таблицы для всего',
          approach: 'Универсальность',
          overlap: 'Базовые задачи',
          differentiation: 'Специализация, автоматизация'
        }
      ]
    }
  };
  
  return competitorsMap[productType.id] || competitorsMap.saas;
}

// Generate CJM stages based on idea context
// Professional methodology: UXPressia, RightHook, UX Journal, UX Planet, Visual Paradigm
function generateContextualCJM(idea: Idea, _analysis: SourceAnalysis): {
  title: string;
  mermaidSections: string;
  detailedTable: string;
  recommendations: string;
  persona: string;
  emotionalArc: string;
  momentsOfTruth: string;
} {
  const productName = idea.name;
  const functions = idea.functions || [];
  const userTypes = idea.userTypes || '';
  const valueProp = idea.valueProposition || '';

  // === EXTRACT PERSONA FROM CONTEXT ===
  const persona = extractPersonaFromContext(userTypes, idea.description);

  // === BUILD CONTEXTUAL STAGES ===
  // Каждый этап привязан к КОНКРЕТНОМУ продукту и его функциям
  const stages = [
    {
      name: 'Осознание потребности',
      description: `${persona.name} понимает, что нуждается в решении: ${idea.description?.substring(0, 50) || 'своей задачи'}`,
      actions: [
        `Формулирует проблему: "Как ${functions[0]?.toLowerCase() || 'решить задачу'}?"`,
        `Ищет в поиске: "${productName} ${functions[0]?.toLowerCase() || 'решение'}"`,
        'Обсуждает с коллегами'
      ],
      thinking: [
        `Мне нужно ${functions[0]?.toLowerCase() || 'решить задачу'}`,
        `Интересно, есть ли готовое решение типа ${productName}`
      ],
      emotions: { name: 'Заинтересованность', intensity: -1, triggers: ['Понимание проблемы', 'Надежда на решение'] },
      painPoints: [
        { point: `Не знает о существовании ${productName}`, severity: 'high', source: 'Нет узнаваемости' },
        { point: 'Много разрозненной информации', severity: 'medium', source: 'Перегрузка рынка' }
      ],
      opportunities: [
        { opp: `SEO под запросы: "${functions[0]?.toLowerCase() || 'решение'}"`, impact: 'high', effort: 'medium' },
        { opp: 'Контент о проблеме в соцсетях', impact: 'medium', effort: 'low' }
      ],
      touchpoints: ['Поиск (Google/Яндекс)', 'Соцсети', 'Коллеги']
    },
    {
      name: 'Поиск и исследование',
      description: `Изучение ${productName} и сравнение с альтернативами`,
      actions: [
        `Открывает сайт ${productName}`,
        `Изучает: ${functions.slice(0, 2).join(', ') || 'функции'}`,
        'Читает отзывы и кейсы',
        'Сравнивает с конкурентами'
      ],
      thinking: [
        `Что конкретно даёт ${productName}?`,
        `${valueProp || 'Подходит ли мне это решение'}?`,
        'Сколько это стоит?'
      ],
      emotions: { name: 'Интерес', intensity: 1, triggers: ['Понятное УТП', 'Хорошие отзывы'] },
      painPoints: [
        { point: 'Сложно сравнить с конкурентами', severity: 'high', source: 'Нет сравнения' },
        { point: 'Не хватает деталей о функциях', severity: 'medium', source: 'Слабый контент' }
      ],
      opportunities: [
        { opp: 'Таблица сравнения с конкурентами', impact: 'high', effort: 'low' },
        { opp: `Демо ${functions[0]?.toLowerCase() || 'функционала'}`, impact: 'high', effort: 'medium' }
      ],
      touchpoints: [`Сайт ${productName}`, 'Отзывы', 'YouTube']
    },
    {
      name: 'Оценка и сравнение',
      description: `Сравнение ${productName} с альтернативами и принятие решения`,
      actions: [
        'Сравнивает тарифы и функции',
        `Проверяет: ${functions.slice(0, 3).join(', ') || 'функционал'}`,
        'Смотрит демо/триал',
        'Консультируется с поддержкой'
      ],
      thinking: [
        `${productName} vs конкуренты — что лучше?`,
        'Оправдывает ли цена ценность?',
        'Есть ли риски?'
      ],
      emotions: { name: 'Аналитическое настроение', intensity: 0, triggers: ['Понятные отличия', 'Прозрачные цены'] },
      painPoints: [
        { point: 'Неясны отличия от конкурентов', severity: 'high', source: 'Непрозрачность' },
        { point: 'Страх ошибиться с выбором', severity: 'medium', source: 'Психологический барьер' }
      ],
      opportunities: [
        { opp: 'Калькулятор ценности/ROI', impact: 'high', effort: 'medium' },
        { opp: 'Гарантия возврата/Триал', impact: 'high', effort: 'low' }
      ],
      touchpoints: ['Сайт конкурентов', 'Тарифы', 'Чат поддержки']
    },
    {
      name: 'Принятие решения',
      description: `Регистрация и начало работы с ${productName}`,
      actions: [
        'Заполняет форму регистрации',
        'Выбирает тариф',
        'Проходит онбординг',
        `Настраивает: ${functions[0]?.toLowerCase() || 'основные функции'}`
      ],
      thinking: [
        'Надеюсь, это решит мою задачу',
        `С чего начать в ${productName}?`
      ],
      emotions: { name: 'Волнение + Надежда', intensity: 2, triggers: ['Быстрая регистрация', 'Понятный онбординг'] },
      painPoints: [
        { point: 'Долгая регистрация', severity: 'medium', source: 'UX проблемы' },
        { point: 'Непонятный первый шаг', severity: 'low', source: 'Слабый onboarding' }
      ],
      opportunities: [
        { opp: 'Регистрация в 2 клика', impact: 'high', effort: 'low' },
        { opp: 'Интерактивный онбординг', impact: 'high', effort: 'medium' }
      ],
      touchpoints: ['Форма регистрации', 'Онбординг', 'Email подтверждение']
    },
    {
      name: 'Использование',
      description: `Активная работа с ${productName} для решения задач`,
      actions: [
        `Использует: ${functions[0] || 'основную функцию'}`,
        functions[1] ? `Пробует: ${functions[1]}` : 'Осваивает интерфейс',
        'Решает свои задачи',
        'Обращается в поддержку при необходимости'
      ],
      thinking: [
        valueProp || 'Это действительно помогает!',
        `Как использовать ${functions[0]?.toLowerCase() || 'эту функцию'}?`
      ],
      emotions: { name: 'Удовлетворение', intensity: 3, triggers: ['Быстрый результат', 'Удобство'] },
      painPoints: [
        { point: 'Кривая обучения', severity: 'medium', source: 'Новый продукт' },
        { point: 'Не все функции очевидны', severity: 'low', source: 'UX проблемы' }
      ],
      opportunities: [
        { opp: 'Контекстная помощь', impact: 'medium', effort: 'low' },
        { opp: 'Quick win за 5 минут', impact: 'high', effort: 'medium' }
      ],
      touchpoints: [productName, 'Помощь/FAQ', 'Поддержка']
    },
    {
      name: 'Лояльность',
      description: `Формирование привязанности к ${productName} и рекомендации`,
      actions: [
        'Регулярно использует продукт',
        'Рекомендует коллегам',
        'Оставляет отзыв',
        'Переходит на премиум'
      ],
      thinking: [
        `${productName} стал частью моей работы`,
        'Надо рассказать команде'
      ],
      emotions: { name: 'Доверие + Привязанность', intensity: 4, triggers: ['Стабильный результат', 'Превышение ожиданий'] },
      painPoints: [
        { point: 'Нет ощущения сообщества', severity: 'low', source: 'Отсутствие комьюнити' },
        { point: 'Забывает о продукте', severity: 'low', source: 'Низкий engagement' }
      ],
      opportunities: [
        { opp: 'Реферальная программа', impact: 'high', effort: 'low' },
        { opp: 'Комьюнити/Чат пользователей', impact: 'medium', effort: 'medium' }
      ],
      touchpoints: ['Email-рассылка', 'Реферальная ссылка', 'Комьюнити']
    }
  ];

  // === BUILD MERMAID JOURNEY ===
  const mermaidSections = stages.map((stage, i) => {
    const score = Math.max(1, Math.min(5, stage.emotions.intensity + 3)); // 1-5 scale
    const sectionActions = stage.actions.slice(0, 3).map(a => `      ${a}: ${score}`).join('\n');
    return `    section ${stage.name}\n${sectionActions}`;
  }).join('\n');

  // === BUILD DETAILED TABLE WITH COLOR-CODED ROLES ===
  // Role colors: persona=blue, touchpoint=purple, pain=red, opportunity=green, emotion=amber
  const detailedTable = stages.map((stage, i) => `### Этап ${i + 1}: ${stage.name}

*${stage.description}*

| Аспект | Детали |
|--------|--------|
| **Действия** | ${stage.actions.map(a => `[:role:persona]${a}[/role]`).join('<br>')} |
| **Мысли** | ${stage.thinking.map(t => `[:role:persona]"${t}"[/role]`).join('<br>')} |
| **Эмоция** | [:role:emotion]${stage.emotions.name} (${stage.emotions.intensity > 0 ? '+' : ''}${stage.emotions.intensity})[/role] |
| **Триггеры эмоции** | ${stage.emotions.triggers.map(t => `[:role:emotion]${t}[/role]`).join(', ')} |
| **Touchpoints** | ${stage.touchpoints.map(t => `[:role:touchpoint]${t}[/role]`).join(', ')} |
| **Боли** | ${stage.painPoints.map(p => `[:role:pain][${p.severity}] ${p.point}[/role]`).join('<br>')} |
| **Возможности** | ${stage.opportunities.map(o => `[:role:opportunity]${o.opp} (${o.impact}/${o.effort})[/role]`).join('<br>')} |`).join('\n\n---\n\n');

  // === RECOMMENDATIONS (Quick Wins first) ===
  const quickWins = stages.flatMap(s => s.opportunities.filter(o => o.impact === 'high' && o.effort === 'low'));
  const recommendations = quickWins.slice(0, 3).map((r, i) => `${i + 1}. [:role:opportunity]**${r.opp}** (Quick Win: высокий эффект, низкие затраты)[/role]`).join('\n');

  // === EMOTIONAL ARC ===
  const emotionalArc = `**Тренд:** Улучшение (от -1 до +4)
[:role:pain]**Низшая точка:** "Осознание потребности" (-1) — не знает о продукте[/role]
[:role:emotion]**Высшая точка:** "Лояльность" (+4) — доверие и рекомендации[/role]`;

  // === MOMENTS OF TRUTH ===
  const momentsOfTruth = `1. [:role:touchpoint]**Первый контакт с сайтом** — понятное УТП за 5 секунд[/role]
2. [:role:touchpoint]**Сравнение с конкурентами** — таблица отличий[/role]
3. [:role:touchpoint]**Первое использование** — quick win за 5 минут[/role]`;

  return {
    title: `Путь ${persona.name}: ${productName}`,
    mermaidSections,
    detailedTable,
    recommendations,
    persona: `### [:role:persona]Персона: ${persona.name}[/role]
- **Роль:** [:role:persona]${persona.role}[/role]
- **Демография:** ${persona.demographics}
- **Цели:** [:role:opportunity]${persona.goals}[/role]
- **Фрустрации:** [:role:pain]${persona.frustrations}[/role]`,
    emotionalArc,
    momentsOfTruth
  };
}

// Helper: Extract persona from userTypes context
function extractPersonaFromContext(userTypes: string, description: string): {
  name: string;
  role: string;
  demographics: string;
  goals: string;
  frustrations: string;
} {
  const text = `${userTypes} ${description}`.toLowerCase();

  // Detect role from context
  if (text.includes('предприниматель') || text.includes('бизнесмен') || text.includes('владелец')) {
    return {
      name: 'Андрей',
      role: 'Предприниматель',
      demographics: '30-45 лет, владелец малого бизнеса',
      goals: 'Масштабировать бизнес, экономить время',
      frustrations: 'Нет времени на обучение, нужны быстрые результаты'
    };
  }
  if (text.includes('маркетолог') || text.includes('marketing')) {
    return {
      name: 'Ольга',
      role: 'Маркетолог',
      demographics: '25-35 лет, специалист по продвижению',
      goals: 'Привлекать клиентов, автоматизировать рутину',
      frustrations: 'Сложные инструменты, непонятная аналитика'
    };
  }
  if (text.includes('разработчик') || text.includes('программист') || text.includes('it')) {
    return {
      name: 'Дмитрий',
      role: 'Разработчик',
      demographics: '25-40 лет, IT-специалист',
      goals: 'Эффективные инструменты, чистый код',
      frustrations: 'Плохая документация, сложные API'
    };
  }
  if (text.includes('студент') || text.includes('учащийся')) {
    return {
      name: 'Максим',
      role: 'Студент',
      demographics: '18-25 лет, учится',
      goals: 'Быстро освоить, бесплатно или дёшево',
      frustrations: 'Сложно понять, нет денег на подписки'
    };
  }

  // Default persona
  return {
    name: 'Алексей',
    role: 'Специалист',
    demographics: '25-40 лет, работает в сфере',
    goals: 'Решить задачу эффективно',
    frustrations: 'Мало времени, сложно выбрать'
  };
}

// Extract source text from message (find the raw transcription)
function extractSourceText(message: string): string {
  // Look for the original transcription after special markers
  let sourceText = message;
  
  // If message contains "Загруженная транскрибация:" or similar
  const markers = ['Загруженная транскрибация:', 'Транскрибация:', 'Исходный текст:'];
  for (const marker of markers) {
    if (message.includes(marker)) {
      const idx = message.indexOf(marker);
      sourceText = message.substring(idx + marker.length).trim();
      break;
    }
  }
  
  // If message contains prompt instructions, extract the actual content
  const promptMarkers = ['Проанализируй текст', 'Структура ответа', 'Исходный текст:'];
  for (const marker of promptMarkers) {
    if (sourceText.includes(marker)) {
      const parts = sourceText.split(marker);
      // Usually the actual content is after the last "Исходный текст:" marker
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i].trim().length > 100) {
          sourceText = parts[i].trim();
          break;
        }
      }
    }
  }
  
  // Try to find dialog-style text (lines with "Name: text")
  const dialogLines = message.split('\n').filter(line => /^[А-ЯA-Z][а-яa-zA-Z]+:\s/.test(line.trim()));
  if (dialogLines.length > 2) {
    sourceText = dialogLines.join('\n');
  }
  
  // Fallback: look for paragraphs that aren't instructions
  if (sourceText.length < 100 || sourceText.includes('Проанализируй') || sourceText.includes('Структура ответа')) {
    const paragraphs = message.split('\n\n');
    for (let i = paragraphs.length - 1; i >= 0; i--) {
      if (!paragraphs[i].includes('Проанализируй') && 
          !paragraphs[i].includes('Структура ответа') &&
          !paragraphs[i].startsWith('##')) {
        sourceText = paragraphs[i].trim();
        break;
      }
    }
  }
  if (!sourceText || sourceText.length < 20) {
    sourceText = message.trim();
  }

  return sourceText;
}

// Main fallback function
export function getFallbackResponse(agentType: string, message: string): string {
  const sourceText = extractSourceText(message);
  
  // === TRANSCRIPTION ANALYST ===
  if (agentType === 'transcription_analyst') {
    console.log(`[Fallback transcription_analyst] sourceText: "${sourceText.substring(0, 200)}..."`);
    const idea = extractIdeaFromTranscription(sourceText);
    return formatIdeaAsMarkdown(idea);
  }

  // === Extract idea for other agents ===
  const formedIdea = extractIdeaFromMarkdown(message) || extractIdeaFromMarkdown(sourceText);
  const idea: Idea = formedIdea ? {
    name: formedIdea.name,
    description: formedIdea.description,
    functions: formedIdea.functions,
    useCases: formedIdea.useCases || [],
    userTypes: formedIdea.userTypes || '',
    valueProposition: formedIdea.valueProposition || '',
    risks: formedIdea.risks || [],
    difficulties: formedIdea.difficulties || [],
  } : extractIdeaFromTranscription(sourceText);

  console.log(`[getFallbackResponse] Извлечена идея: "${idea.name}", функций: ${idea.functions.length}`);

  // Create sourceAnalysis for CJM
  const sourceAnalysis: SourceAnalysis = {
    name: idea.name,
    description: idea.description,
    functions: idea.functions,
    useCases: idea.useCases || [],
    userTypes: idea.userTypes || '',
    valueProposition: idea.valueProposition || '',
    risks: idea.risks || [],
    difficulties: idea.difficulties || [],
    valueImprovements: [],
    differentiationStrategy: '',
    finalScore: ''
  };

  // === BRAND MARKETER ===
  if (agentType === 'brand_marketer') {
    const fullContext = message + ' ' + idea.name + ' ' + idea.description + ' ' + idea.functions.join(' ');
    const productType = detectProductTypeInline(fullContext);

    const competitors = generateCompetitors(productType, idea);

    return `## 🔍 Конкурентный анализ для "${idea.name}"

### Тип продукта: ${productType.name}

---

### 1. ПРЯМЫЕ КОНКУРЕНТЫ (3 продукта)

${competitors.direct.map((c, i) => `#### ${i + 1}. ${c.name} ${c.country ? `(${c.country})` : ''}
- **Сайт:** ${c.url}
- **Описание:** ${c.description}
- **Основные функции:** ${c.features}
- **Ценовая модель:** ${c.pricing}
- **Целевая аудитория:** ${c.targetAudience}

**SWOT-анализ:**
| Сильные стороны | Слабые стороны |
|-----------------|----------------|
| ${c.strengths.join('<br>')} | ${c.weaknesses.join('<br>')} |

| Возможности | Угрозы |
|-------------|--------|
| ${c.opportunities.join('<br>')} | ${c.threats.join('<br>')} |
`).join('\n')}

### 2. КОСВЕННЫЕ КОНКУРЕНТЫ

${competitors.indirect.map((c, i) => `#### ${i + 1}. ${c.name}
- **Описание:** ${c.description}
- **Как решает проблему:** ${c.approach}
- **Пересечение с нашим продуктом:** ${c.overlap}
- **Ключевые отличия:** ${c.differentiation}
`).join('\n')}

### 3. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ

На основе анализа конкурентов, ключевые возможности для дифференциации **${idea.name}**:

1. **Упрощение интерфейса** — большинство конкурентов имеют перегруженный UI
2. **Качество контента** — фокус на практическую пользу, а не на новости
3. **Интерактивные инструменты** — калькуляторы, шаблоны, чек-листы
4. **Комьюнити** — активное сообщество, нетворкинг, ивенты
5. **Персонализация** — рекомендации под интересы пользователя

### 4. РЕКОМЕНДАЦИИ ПО ПОЗИЦИОНИРОВАНИЮ

${idea.name} должен позиционироваться как ${productType.positioning} с акцентом на:
- ${idea.functions[0] || 'Практическую ценность'}
- Качество и глубину контента
- Активное комьюнити

### 5. SWOT-АНАЛИЗ ПРОДУКТА

**СИЛЫ (Strengths):**
- ${idea.valueProposition || 'Уникальный контент'}
- Практический фокус
- Интерактивные инструменты

**СЛАБОСТИ (Weaknesses):**
- Ограниченные ресурсы
- Новая платформа
- Нужно набирать аудиторию

**ВОЗМОЖНОСТИ (Opportunities):**
- Рост интереса к предпринимательству
- Недовольство качеством конкурентов
- Подписочные модели

**УГРОЗЫ (Threats):**
- Конкуренция с крупными игроками
- Отток аудитории в Telegram
- Монетизация`;
  }

  // === CJM RESEARCHER ===
  if (agentType === 'cjm_researcher') {
    const cjmStages = generateContextualCJM(idea, sourceAnalysis);

    return `## 🗺️ Customer Journey Map: ${idea.name}

${cjmStages.persona}

---

\`\`\`mermaid
journey
    title ${cjmStages.title}
${cjmStages.mermaidSections}
\`\`\`

---

### 📊 Детальный анализ этапов

${cjmStages.detailedTable}

---

### 📈 Эмоциональная дуга

${cjmStages.emotionalArc}

---

### ⚡ Моменты истины

${cjmStages.momentsOfTruth}

---

### 💡 Рекомендации (Quick Wins)

${cjmStages.recommendations}

---

### Ключевые инсайты для "${idea.name}"

**Суть продукта:** ${idea.description}

**Целевая аудитория:**
${idea.userTypes || 'Не определена'}

**Ключевая ценность:** ${idea.valueProposition || 'Не определена'}

**Точки боли:**
${idea.risks.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Не определены'}`;
  }

  // === IA ARCHITECT ===
  if (agentType === 'ia_architect') {
    const iaResult = generateIAFromIdea(idea);
    const cleanName = idea.name.replace(/\*\*/g, '').replace(/["«»]/g, '').trim();

    return `## 🏗️ Информационная архитектура для "${cleanName}"

### 📋 Контекст продукта

**Описание:** ${idea.description}

**Ключевые функции:**
${idea.functions.slice(0, 5).map((f, i) => `${i + 1}. ${f}`).join('\n') || 'Не определены'}

---

### 🗺️ Структура продукта (Mermaid)

${iaResult.mermaidDiagram}

---

### 📄 Детальное описание страниц

${iaResult.pages.map((page, idx) => `#### ${idx + 1}. ${page.name}

**URL:** \`${page.url}\`

**Цель страницы:** ${page.purpose}

**Элементы данных:**
${page.dataElements.map((d, i) => `  ${i + 1}. ${d}`).join('\n')}
`).join('\n---\n')}

### 💡 Рекомендации по IA для "${cleanName}"

- **Структура:** ${iaResult.pages.length} ключевых страниц
- **Глубина:** максимум 2 уровня вложенности
- **Поиск:** по ключевым сущностям
- **Связи:** логические переходы между страницами`;
  }

  // === PROTOTYPER ===
  if (agentType === 'prototyper') {
    const cleanName = idea.name.replace(/\*\*/g, '').replace(/["«»]/g, '').trim();
    const safeFunctions = idea.functions || [];
    const func1 = safeFunctions[0] || 'Основная функция';
    const func2 = safeFunctions[1] || 'Дополнительные возможности';
    const func3 = safeFunctions[2] || 'Настройки';

    return `## 🎨 Интерактивный прототип "${cleanName}"

\`\`\`html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cleanName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: #000; color: #fff; min-height: 100vh; }
        .screen { display: none; padding: 20px; }
        .screen.active { display: block; }
        nav { position: fixed; bottom: 0; left: 0; right: 0; background: #111; padding: 10px; display: flex; gap: 10px; justify-content: center; }
        nav button { background: #facc15; color: #000; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        h1 { font-size: 24px; margin-bottom: 16px; }
        .card { background: #1a1a1a; padding: 16px; border-radius: 12px; margin: 8px 0; }
    </style>
</head>
<body>
    <div id="main" class="screen active">
        <h1>${cleanName}</h1>
        <p style="color: #888; margin-bottom: 20px;">${idea.description.substring(0, 100)}</p>
        <div class="card">${func1}</div>
        <div class="card">${func2}</div>
        <div class="card">${func3}</div>
    </div>
    <div id="profile" class="screen">
        <h1>Профиль</h1>
        <div class="card">Настройки аккаунта</div>
    </div>
    <nav>
        <button onclick="showScreen('main')">Главная</button>
        <button onclick="showScreen('profile')">Профиль</button>
    </nav>
    <script>
        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }
    </script>
</body>
</html>
\`\`\`

Прототип готов для тестирования. Откройте HTML файл в браузере для просмотра.`;
  }

  // === TASK ARCHITECT ===
  if (agentType === 'task_architect') {
    const safeFunctions = idea.functions || [];
    return `## 📋 Тест-кейсы для "${idea.name}"

### 1. Функциональные тесты

| ID | Тест-кейс | Описание | Ожидаемый результат |
|----|-----------|----------|---------------------|
| TC001 | ${safeFunctions[0] || 'Основная функция'} | Проверка основной функции | Успешное выполнение |
| TC002 | ${safeFunctions[1] || 'Вторая функция'} | Проверка второй функции | Корректный результат |
| TC003 | ${safeFunctions[2] || 'Третья функция'} | Проверка третьей функции | Успешное выполнение |

### 2. Сценарии использования

**Сценарий 1:** Пользователь открывает приложение
- **Дано:** Пользователь первый раз в приложении
- **Когда:** Открывает главную страницу
- **Тогда:** Видит приветствие и ключевые функции

**Сценарий 2:** Выполнение основной задачи
- **Дано:** Пользователь на главной странице
- **Когда:** Нажимает на "${safeFunctions[0]?.substring(0, 20) || 'действие'}"
- **Тогда:** Переходит к выполнению функции

### 3. Рекомендации

1. Добавить onboarding для новых пользователей
2. Создать систему подсказок
3. Реализовать feedback на каждом шаге`;
  }

  return `Обработка запроса. Попробуйте ещё раз.`;
}

// Helper function to extract formed idea from markdown
function extractFormedIdea(message: string): { name: string; description: string; functions: string[] } | null {
  // Try to find name in markdown
  let name = '';
  const nameMatch = message.match(/## 💡\s*Название идеи\s*\n\*\*([^*]+)\*\*/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  // Try to find description
  let description = '';
  const descMatch = message.match(/### Описание сути\s*\n([^\n#]+)/i);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  // Try to find functions
  const functions: string[] = [];
  const funcSection = message.match(/### Основные функции\s*\n([\s\S]*?)(?=###|$)/i);
  if (funcSection) {
    const funcLines = funcSection[1].match(/\d+\.\s*(.+)/g);
    if (funcLines) {
      funcLines.forEach(line => {
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        if (cleaned && !cleaned.startsWith('*')) {
          functions.push(cleaned);
        }
      });
    }
  }

  if (!name && !description && functions.length === 0) {
    return null;
  }

  return {
    name,
    description,
    functions,
  };
}
