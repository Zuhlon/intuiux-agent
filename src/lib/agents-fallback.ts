// Agent Fallback Responses - Pure context extraction
import {
  extractIdeaFromTranscription,
  extractIdeaFromMarkdown,
  formatIdeaAsMarkdown,
  generateIAFromIdea,
  type AgentContext
} from './agent-context';

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
      keywords: ['приложение', 'мобильный', 'ios', 'android'],
      marketSize: '$200 млрд',
      trends: ['AI', 'Персонализация', 'Super apps'],
      barriers: ['Разработка', 'Маркетинг'],
      positioning: 'инновационное мобильное приложение'
    };
  }
  
  if (lowerText.includes('сервис') || lowerText.includes('платформ') || lowerText.includes('saas')) {
    return {
      id: 'saas',
      name: 'SaaS-платформа',
      keywords: ['сервис', 'платформа', 'saas'],
      marketSize: '$150 млрд',
      trends: ['AI', 'Интеграции', 'Low-code'],
      barriers: ['Конкуренция', 'Удержание'],
      positioning: 'современная SaaS-платформа'
    };
  }
  
  return {
    id: 'default',
    name: 'Цифровой продукт',
    keywords: [],
    marketSize: 'Определяется',
    trends: ['Цифровизация', 'AI'],
    barriers: ['Конкуренция'],
    positioning: 'инновационный цифровой продукт'
  };
}

// Generate competitors based on product type
function generateCompetitors(productType: ProductType, idea: Idea): {
  direct: Competitor[];
  indirect: IndirectCompetitor[];
} {
  const competitors: Competitor[] = [];
  const indirectCompetitors: IndirectCompetitor[] = [];

  // Direct competitors based on product type
  const directCompetitorTemplates: Record<string, Competitor[]> = {
    ecommerce: [
      {
        name: 'Wildberries',
        url: 'https://wildberries.ru',
        description: 'Крупнейший маркетплейс в России',
        features: 'Каталог, отзывы, быстрая доставка',
        pricing: 'Комиссия с продаж',
        targetAudience: 'Массовый потребитель',
        strengths: ['Огромный выбор', 'Быстрая доставка', 'Известность'],
        weaknesses: ['Высокая комиссия', 'Конкуренция между продавцами', 'Контроль качества'],
        opportunities: ['Развитие премиум-сегмента', 'Улучшение сервиса'],
        threats: ['Новые игроки', 'Регуляторные риски'],
        functionalityScore: '⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐',
        country: 'Россия'
      },
      {
        name: 'OZON',
        url: 'https://ozon.ru',
        description: 'Экосистема для бизнеса и покупателей',
        features: 'Каталог, маркетплейс, логистика',
        pricing: 'Комиссия с продаж',
        targetAudience: 'Массовый потребитель',
        strengths: ['Экосистема', 'Финансовые сервисы', 'Логистика'],
        weaknesses: ['Сложность', 'Конкуренция', 'Качество селлеров'],
        opportunities: ['B2B сервисы', 'Финтех'],
        threats: ['Санкции', 'Новые игроки'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐',
        country: 'Россия'
      },
      {
        name: 'Яндекс.Маркет',
        url: 'https://market.yandex.ru',
        description: 'Сравнение цен и товаров',
        features: 'Сравнение цен, отзывы, магазины',
        pricing: 'Платное размещение',
        targetAudience: 'Информированные покупатели',
        strengths: ['Сравнение цен', 'Интеграция с Яндекс', 'Отзывы'],
        weaknesses: ['Меньше товаров', 'Зависимость от партнёров'],
        opportunities: ['AI-рекомендации', 'Голосовой поиск'],
        threats: ['Конкуренция с маркетплейсами'],
        functionalityScore: '⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐',
        country: 'Россия'
      }
    ],
    booking: [
      {
        name: 'YClients',
        url: 'https://yclients.ru',
        description: 'Платформа для записи онлайн',
        features: 'Онлайн-запись, CRM, маркетинг',
        pricing: 'Подписка от 990₽/мес',
        targetAudience: 'Салоны красоты, фитнес, медицина',
        strengths: ['Лидер рынка', 'Интеграции', 'CRM'],
        weaknesses: ['Сложность', 'Цена для малого бизнеса'],
        opportunities: ['AI-ассистент', 'Телемедицина'],
        threats: ['Dikidi', 'Новые игроки'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐',
        country: 'Россия'
      },
      {
        name: 'Dikidi',
        url: 'https://dikidi.ru',
        description: 'Онлайн-запись 24/7',
        features: 'Запись, расписание, напоминания',
        pricing: 'Бесплатно + премиум',
        targetAudience: 'Малый бизнес, фрилансеры',
        strengths: ['Бесплатный старт', 'Простота', '24/7'],
        weaknesses: ['Меньше функций', 'Нет CRM'],
        opportunities: ['Развитие функций', 'Интеграции'],
        threats: ['YClients', 'Сложность рынка'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐',
        country: 'Россия'
      },
      {
        name: 'Clockwise',
        url: 'https://clockwise.me',
        description: 'Scheduling for teams',
        features: 'Team scheduling, calendar sync',
        pricing: 'Freemium',
        targetAudience: 'Команды, enterprise',
        strengths: ['AI scheduling', 'Team focus', 'Integrations'],
        weaknesses: ['Меньше подходит для B2C', 'Английский язык'],
        opportunities: ['Российский рынок'],
        threats: ['Локальные конкуренты'],
        functionalityScore: '⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐',
        country: 'US'
      }
    ],
    default: [
      {
        name: 'Generic Competitor 1',
        url: 'https://example.com',
        description: 'Конкурент в этой нише',
        features: 'Основные функции',
        pricing: 'Различные модели',
        targetAudience: 'Широкая аудитория',
        strengths: ['Опыт', 'Ресурсы', 'Бренд'],
        weaknesses: ['Медленная адаптация', 'Сложность'],
        opportunities: ['Новые технологии', 'Нишевые сегменты'],
        threats: ['Новые игроки', 'Технологические изменения'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐'
      }
    ]
  };

  const selectedDirect = directCompetitorTemplates[productType.id] || directCompetitorTemplates.default;
  competitors.push(...selectedDirect);

  // Indirect competitors
  indirectCompetitors.push(
    {
      name: 'Excel/Google Sheets',
      description: 'Таблицы для учёта',
      approach: 'Самостоятельное ведение',
      overlap: 'Организация данных',
      differentiation: 'Нет автоматизации'
    },
    {
      name: 'Telegram/WhatsApp',
      description: 'Мессенджеры для коммуникации',
      approach: 'Прямая связь',
      overlap: 'Коммуникация',
      differentiation: 'Нет структуры данных'
    },
    {
      name: 'Бухгалтерские системы',
      description: '1С, Мое дело и др.',
      approach: 'Финансовый учёт',
      overlap: 'Учёт транзакций',
      differentiation: 'Сложность и цена'
    }
  );

  return { direct: competitors, indirect: indirectCompetitors };
}

// Generate CJM stages
function generateContextualCJM(idea: Idea, sourceAnalysis: SourceAnalysis): {
  title: string;
  mermaidSections: string;
  detailedTable: string;
  recommendations: string;
} {
  console.log('[generateContextualCJM] Генерация CJM для:', idea.name);

  const safeFunctions = idea.functions || [];
  const safeUseCases = sourceAnalysis?.useCases || [];

  // Determine product type for contextual stages
  const fullContext = `${idea.name} ${idea.description} ${safeFunctions.join(' ')} ${safeUseCases.join(' ')}`;
  const lowerContext = fullContext.toLowerCase();

  // Build stages based on context
  const stages: { name: string; steps: { action: string; emotion: number }[] }[] = [];

  // Default stages for any product
  stages.push(
    { name: 'Осознание', steps: [
      { action: 'Пользователь понимает потребность', emotion: 2 },
      { action: 'Ищет решение проблемы', emotion: 2 }
    ]},
    { name: 'Поиск', steps: [
      { action: 'Находит продукт', emotion: 3 },
      { action: 'Изучает возможности', emotion: 3 }
    ]},
    { name: 'Использование', steps: [
      { action: 'Пробует ключевые функции', emotion: 4 },
      { action: 'Получает первый результат', emotion: 4 }
    ]},
    { name: 'Удержание', steps: [
      { action: 'Возвращается к продукту', emotion: 4 },
      { action: 'Рекомендует другим', emotion: 5 }
    ]}
  );

  // Add function-specific stages
  if (safeFunctions.length > 0) {
    safeFunctions.slice(0, 2).forEach((func, idx) => {
      stages.splice(2 + idx, 0, {
        name: func.substring(0, 25),
        steps: [
          { action: `Использует: ${func.substring(0, 50)}`, emotion: 4 }
        ]
      });
    });
  }

  // Generate mermaid sections
  const mermaidSections = stages.map(stage => {
    const sectionHeader = `    section ${stage.name}`;
    const steps = stage.steps.map((step, idx) => 
      `      ${step.action}: ${step.emotion}`
    ).join('\n');
    return `${sectionHeader}\n${steps}`;
  }).join('\n');

  // Generate detailed table
  const detailedTable = stages.map((stage) => {
    const avgEmotion = stage.steps.reduce((sum, s) => sum + s.emotion, 0) / stage.steps.length;
    return `| ${stage.name} | ${stage.steps.map(s => s.action).join(', ')} | ${avgEmotion.toFixed(1)} |`;
  }).join('\n');

  // Generate recommendations
  const recommendations = [
    'Упростите первый контакт с продуктом',
    'Добавьте онбординг для новых пользователей',
    'Создайте точки "quick wins" для быстрого успеха',
    'Внедрите систему уведомлений для удержания',
    'Собирайте обратную связь на каждом этапе'
  ].join('\n');

  return {
    title: `Путь пользователя "${idea.name}"`,
    mermaidSections,
    detailedTable: `| Этап | Действия | Удовлетворённость |\n|------|----------|-----------------|\n${detailedTable}`,
    recommendations
  };
}

// Main fallback response generator
export function getFallbackResponse(agentType: string, message: string): string {
  console.log(`[getFallbackResponse] Agent: ${agentType}`);
  
  const lowerMessage = message.toLowerCase();
  
  // Extract source text
  let sourceText = '';
  const sourceMatch = message.match(/Исходный текст:\s*([\s\S]*)$/i);
  if (sourceMatch && sourceMatch[1]) {
    sourceText = sourceMatch[1].trim();
  }
  if (!sourceText || sourceText.length < 20) {
    const paragraphs = message.split(/\n\n+/).filter(p => p.trim().length > 20);
    if (paragraphs.length > 0) {
      for (let i = paragraphs.length - 1; i >= 0; i--) {
        if (!paragraphs[i].includes('Проанализируй') && 
            !paragraphs[i].includes('Структура ответа') &&
            !paragraphs[i].startsWith('##')) {
          sourceText = paragraphs[i].trim();
          break;
        }
      }
    }
  }
  if (!sourceText || sourceText.length < 20) {
    sourceText = message.trim();
  }

  // === TRANSCRIPTION ANALYST ===
  if (agentType === 'transcription_analyst') {
    console.log(`[Fallback transcription_analyst] sourceText: "${sourceText.substring(0, 200)}..."`);
    const idea = extractIdeaFromTranscription(sourceText);
    return formatIdeaAsMarkdown(idea);
  }

  // === Extract idea for other agents ===
  const formedIdea = extractIdeaFromMarkdown(message) || extractFormedIdea(message);
  const idea: Idea = formedIdea ? {
    name: formedIdea.name,
    description: formedIdea.description,
    functions: formedIdea.functions,
    useCases: [],
    userTypes: '',
    valueProposition: '',
    risks: [],
    difficulties: [],
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

### 2. КОСВЕННЫЕ КОНКУРЕНТЫ (3 продукта)

${competitors.indirect.map((c, i) => `#### ${i + 1}. ${c.name}
- **Описание:** ${c.description}
- **Как решает проблему:** ${c.approach}
- **Пересечение с нашим продуктом:** ${c.overlap}
- **Ключевые отличия:** ${c.differentiation}
`).join('\n')}

### 3. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ

На основе анализа конкурентов, ключевые возможности для дифференциации **${idea.name}**:

1. **Упрощение интерфейса** — большинство конкурентов имеют перегруженный UI
2. **Локализация для РФ** — многие зарубежные решения плохо работают с российскими платёжными системами
3. **Интеграции** — возможность интеграции с популярными российскими сервисами
4. **Ценовая доступность** — конкурентные цены для малого и среднего бизнеса
5. **Персонализация** — адаптация под конкретные потребности клиента

### 4. РЕКОМЕНДАЦИИ ПО ПОЗИЦИОНИРОВАНИЮ

${idea.name} должен позиционироваться как ${productType.positioning} с акцентом на:
- ${(idea.functions || [])[0] || 'Простоту использования'}
- Российский рынок и локальные особенности
- Соотношение цена/качество`;
  }

  // === CJM RESEARCHER ===
  if (agentType === 'cjm_researcher') {
    const cjmStages = generateContextualCJM(idea, sourceAnalysis);

    return `## 🗺️ Customer Journey Map для "${idea.name}"

\`\`\`mermaid
journey
    title ${cjmStages.title}
${cjmStages.mermaidSections}
\`\`\`

### Детальный анализ этапов

${cjmStages.detailedTable}

### Ключевые инсайты для "${idea.name}"

**Суть продукта:** ${idea.description}

**Целевая аудитория:**
${idea.userTypes || 'Не определена'}

**Ключевая ценность:** ${idea.valueProposition || 'Не определена'}

**Точки боли:**
${(idea.risks || []).slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Не определены'}

**Рекомендации по улучшению CJM:**
${cjmStages.recommendations}`;
  }

  // === IA ARCHITECT ===
  if (agentType === 'ia_architect') {
    const iaResult = generateIAFromIdea(idea);
    const cleanName = idea.name.replace(/\*\*/g, '').replace(/["«»]/g, '').trim();

    return `## 🏗️ Информационная архитектура для "${cleanName}"

### 📋 Контекст продукта

**Описание:** ${idea.description}

**Ключевые функции:**
${(idea.functions || []).slice(0, 5).map((f, i) => `${i + 1}. ${f}`).join('\n') || 'Не определены'}

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

  return { name, description, functions };
}
