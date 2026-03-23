'use client';
// UX Pipeline App
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { MessageContent } from '@/components/MessageContent';
import { 
  Upload, 
  Sparkles, 
  FileText, 
  X, 
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Network,
  Users,
  Github,
  Mail,
  ClipboardList,
  BarChart,
  RefreshCw,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Send,
  Square,
  Play,
  MessageSquare
} from 'lucide-react';

// Icon mapping for dynamic stages
const ICON_MAP: Record<string, any> = {
  Lightbulb,
  BarChart3,
  TrendingUp,
  Network,
  Users,
  Github,
  Mail,
  ClipboardList,
  BarChart,
  Sparkles
};

// Color mapping for dynamic stages
const COLOR_MAP: Record<string, string> = {
  idea: 'from-amber-400 to-yellow-500',
  competitors: 'from-orange-400 to-red-500',
  cjm: 'from-emerald-400 to-teal-500',
  ia: 'from-cyan-400 to-blue-500',
  userflow: 'from-blue-400 to-indigo-500',
  prototype: 'from-violet-400 to-purple-500',
  invitation: 'from-pink-400 to-rose-500',
  guideline: 'from-rose-400 to-pink-500',
  metrics: 'from-teal-400 to-emerald-500'
};

// Default stages (used before product type detection)
const DEFAULT_STAGES = [
  {
    id: 'idea',
    name: 'Идея',
    fullName: 'Формирование идеи',
    description: 'Извлечение идеи из текста или транскрипции',
    agent: 'transcription_analyst',
    icon: Lightbulb,
    color: 'from-amber-400 to-yellow-500'
  }
];

// Dynamic stage type
interface DynamicStage {
  id: string;
  name: string;
  fullName: string;
  description: string;
  agent?: string;
  icon: any;
  color: string;
  isOptional?: boolean;
  generateMermaid?: boolean;
}

interface StageResult {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  content: string;
  githubUrl?: string;
}

// Extract product name from idea text
function extractProductName(ideaText: string): string {
  const patterns = [
    /(?:Название|название идеи|продукт)[^:]*:?\s*\*\*?([^*\n]+)\*\*?/i,
    /(?:###?\s*)?(?:Название|Идея)[^:]*:?\s*(.+?)(?:\n|$)/i,
    /^##\s*(.+?)$/m,
    /^#\s*(.+?)$/m
  ];
  
  for (const pattern of patterns) {
    const match = ideaText.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 50);
    }
  }
  
  const lines = ideaText.split('\n').filter(l => l.trim() && !l.startsWith('==='));
  if (lines.length > 0) {
    return lines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '').substring(0, 50);
  }
  
  return 'Продукт';
}

// Extract short summary from idea text for display
function extractIdeaSummary(ideaText: string): { name: string; description: string } {
  let name = 'Продукт';
  let description = '';
  
  const nameLineMatch = ideaText.match(/## 💡\s*Название идеи\s*\n(.+?)(?:\n|$)/i);
  if (nameLineMatch && nameLineMatch[1]) {
    const extracted = nameLineMatch[1].trim();
    if (extracted.length > 2 && !extracted.match(/^(название|идеи|идея|продукта|продукт)$/i)) {
      name = extracted;
    }
  }
  
  if (name === 'Продукт') {
    const boldMatch = ideaText.match(/\*\*([^*]{3,50})\*\*/);
    if (boldMatch && boldMatch[1]) {
      const extracted = boldMatch[1].trim();
      if (!extracted.match(/^(название|идеи|идея|продукта|продукт)$/i)) {
        name = extracted;
      }
    }
  }
  
  const descPatterns = [
    /(?:Описание сути|Описание)[^:]*:?\s*([^\n]+(?:\n[^\n#]+)*?)(?=\n###|\n##|$)/i,
  ];
  
  for (const pattern of descPatterns) {
    const match = ideaText.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (extracted.length > 10) {
        description = extracted.substring(0, 150);
        break;
      }
    }
  }
  
  return { name, description };
}

export default function UXPipelineApp() {
  // Dynamic stages state
  const [pipelineStages, setPipelineStages] = useState<DynamicStage[]>(DEFAULT_STAGES);
  const [productType, setProductType] = useState<string | null>(null);
  const [productTypeLabel, setProductTypeLabel] = useState<string | null>(null);
  
  const [inputText, setInputText] = useState('');
  const [transcriptionFile, setTranscriptionFile] = useState<File | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(-1);
  const [stageResults, setStageResults] = useState<StageResult[]>([]);
  const [activeResultTab, setActiveResultTab] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [githubRepoUrl, setGithubRepoUrl] = useState<string | null>(null);
  const [vercelUrl, setVercelUrl] = useState<string | null>(null);
  const [accessibilityScore, setAccessibilityScore] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Store original source text for all stages (doesn't get cleared)
  const [sourceText, setSourceText] = useState<string>('');
  
  // Stage-specific input texts (except prototype)
  const [stageInputTexts, setStageInputTexts] = useState<Record<string, string>>({});
  
  // Stop generation - use STATE for UI updates + ref for async checks
  const [isStopped, setIsStopped] = useState(false);
  const stopGenerationRef = useRef(false);
  
  // Abort controller for cancelling fetch requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Formed idea summary for display
  const [formedIdeaSummary, setFormedIdeaSummary] = useState<{ name: string; description: string } | null>(null);
  
  // Agent Chat state - for refining ANY agent result with prompts
  const [agentChatMessages, setAgentChatMessages] = useState<Record<string, { role: 'user' | 'assistant'; content: string }[]>>({});
  const [agentChatInput, setAgentChatInput] = useState('');
  const [isAgentChatProcessing, setIsAgentChatProcessing] = useState(false);
  const [activeChatStage, setActiveChatStage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stageResults, currentStage]);

  const handleFileUpload = async (file: File) => {
    setTranscriptionFile(file);
    const text = await file.text();
    setTranscriptionText(text);
  };

  const handleRemoveFile = () => {
    setTranscriptionFile(null);
    setTranscriptionText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Publish prototype to GitHub
  const publishToGitHub = async (htmlContent: string, productName: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent,
          productName,
          readme: `# ${productName}\n\nАвтоматически сгенерированный прототип от IntuiUX Agent.\n\n## Просмотр\nОткройте файл \`index.html\` в браузере.\n\n---\nСоздано с помощью IntuiUX Agent`
        })
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Error publishing to GitHub:', error);
      return null;
    }
  };

  // Detect product type and fetch stages from API
  const detectAndFetchStages = useCallback(async (text: string): Promise<DynamicStage[]> => {
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'detect_product_type',
          inputText: text
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setProductType(data.productType);
        setProductTypeLabel(data.productTypeLabel);
        
        // Convert API stages to DynamicStage format
        const stages: DynamicStage[] = data.stages.map((s: any) => ({
          id: s.name,
          name: s.label,
          fullName: s.label,
          description: s.description,
          icon: ICON_MAP[s.name] || Sparkles,
          color: COLOR_MAP[s.name] || 'from-gray-400 to-gray-500',
          isOptional: s.isOptional,
          generateMermaid: s.generateMermaid
        }));
        
        return stages;
      }
    } catch (error) {
      console.error('Error detecting product type:', error);
    }
    
    // Fallback to default stages
    return DEFAULT_STAGES;
  }, []);

  // Build prompt for each stage
  const buildPrompt = useCallback((
    stageId: string, 
    sourceText: string, 
    formedIdea: string, 
    previousContext: string,
    refinement?: string
  ): string => {
    const ideaSection = formedIdea ? `
═══════════════════════════════════════════════════════════════
🎯 СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА (ОСНОВА ДЛЯ ВСЕХ АРТЕФАКТОВ):
${formedIdea}
═══════════════════════════════════════════════════════════════

` : '';

    const prompts: Record<string, string> = {
      idea: `Проанализируй текст и сформулируй ЧЁТКУЮ ИДЕЮ продукта.

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Извлеки идею ИМЕННО ИЗ ЭТОГО ТЕКСТА
- НЕ используй шаблоны или абстрактные примеры
- Все данные бери ТОЛЬКО из исходного текста
- НЕ придумывай - анализируй контекст

Структура ответа:

## 💡 Название идеи
[Чёткое название в 2-4 слова из контекста текста]

### Описание сути
[Что это за продукт, какую проблему решает - из текста]

### Use Cases (Сценарии использования)
[Конкретные сценарии использования продукта, извлечённые из текста]

### Целевая аудитория и типы пользователей
[Портрет пользователя, роли в системе - из контекста]

### Ключевая ценность (Value Proposition)
[Главное преимущество продукта - из текста]

### Основные функции
1. [Функция 1 - из контекста]
2. [Функция 2 - из контекста]
3. [Функция 3 - из контекста]

### Риски реализации (взгляд маркетолога-критика)
[Конкретные риски для ЭТОЙ идеи на основе анализа рынка]

### Трудности реализации
[Реальные сложности, с которыми столкнётся продукт]

### Рекомендации по оптимизации идеи
**Улучшение ценности:**
[Конкретные предложения как усилить ценность для пользователя]

**Дифференциация:**
[Какое уникальное преимущество выделит продукт среди конкурентов - на основе анализа аналогов]

### Итоговая оценка
[Общая оценка потенциала идеи]

Исходный текст:
${sourceText}`,

      competitors: `${ideaSection}Проведи ПОЛНОЦЕННЫЙ конкурентный анализ ДЛЯ ЭТОЙ КОНКРЕТНОЙ ИДЕИ.

## 1. ПРЯМЫЕ КОНКУРЕНТЫ (3 продукта)
- Название и URL
- Основные функции
- Ценовая модель
- Сильные/слабые стороны

## 2. КОСВЕННЫЕ КОНКУРЕНТЫ (3 продукта)
- Название и описание
- Как решает проблему иначе

## 3. СРАВНИТЕЛЬНАЯ ТАБЛИЦА (Mermaid)

## 4. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ`,

      cjm: `${ideaSection}Создай ПОЛНУЮ Customer Journey Map ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Предыдущий контекст:
${previousContext}

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Создай РЕАЛЬНУЮ CJM на основе контекста продукта
- НЕ копируй описание идеи - генерируй НОВЫЕ артефакты
- Каждый этап должен иметь конкретные touchpoints, emotions, pain points

## 1. ПЕРСОНА
Опиши детально:
- Имя и роль
- Демография (возраст, профессия)
- Цели и мотивации
- Фрустрации и барьеры
- Контекст использования продукта

## 2. MERMAID JOURNEY ДИАГРАММА
\`\`\`mermaid
journey
    title Путь пользователя: [Имя персоны]
    section Осознание
      Узнал о проблеме: 3
      Начал искать решение: 2
    section Рассмотрение  
      Нашёл продукт: 4
      Изучил возможности: 3
    section Решение
      Принял решение: 5
      Совершил действие: 4
    section Использование
      Первый опыт: 3
      Повторное использование: 4
    section Лояльность
      Рекомендация: 5
\`\`\`

## 3. ДЕТАЛЬНОЕ ОПИСАНИЕ ЭТАПОВ (5-7 этапов)
Для КАЖДОГО этапа:
### Этап N: [Название]
- **Touchpoints** (точки контакта): конкретные каналы
- **Действия пользователя**: что делает
- **Эмоции**: positive/negative/neutral + оценка от -5 до +5
- **Pain Points**: конкретные боли
- **Opportunities**: как улучшить

## 4. КРИТИЧЕСКИЕ ТОЧКИ
Где пользователь может уйти?

## 5. КЛЮЧЕВЫЕ ИНСАЙТЫ
3-5 конкретных выводов для улучшения UX`,

      ia: `${ideaSection}Создай ПОЛНУЮ Информационную архитектуру ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Предыдущий контекст:
${previousContext}

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Создай структуру ИМЕННО для этого продукта
- Анализируй функции из идеи и генерируй соответствующие страницы
- Используй ТОЛЬКО Mermaid flowchart TD (НЕ mindmap)
- Каждая страница должна содержать конкретные данные
- НЕ используй шаблоны - всё из контекста идеи

## 1. MERMAID ДИАГРАММА СТРУКТУРЫ С ДАННЫМИ
\`\`\`mermaid
flowchart TD
    root["Название продукта<br/><small>Краткое описание</small>"]
    
    subgraph p0_sub ["📄 Главная"]
        p0_d0["Название продукта"]
        p0_d1["Ключевое действие"]
        p0_d2["Обзор функций"]
    end
    
    subgraph p1_sub ["📄 Страница из функции 1"]
        p1_url["🔗 /url-slug"]
        p1_d0["Данные на странице"]
        p1_d1["Ещё данные"]
    end
    
    root --> p0_sub
    root --> p1_sub
    p0_sub -.->|"навигация"| p1_sub
    
    style root fill:#f5b942,stroke:#d97706,stroke-width:3px,color:#000
\`\`\`

## 2. ДЕТАЛЬНОЕ ОПИСАНИЕ СТРАНИЦ
Для КАЖДОЙ страницы из функций идеи:

### [Название страницы из функции]
- **URL:** /путь
- **Цель:** что пользователь делает на этой странице
- **Элементы данных:**
  1. **Данные 1** — описание
  2. **Данные 2** — описание
  3. **Данные 3** — описание
- **Переходы:** на какие страницы можно перейти

## 3. ТАКСОНОМИЯ СУЩНОСТЕЙ
Основные сущности продукта (определяются из контекста идеи):
\`\`\`mermaid
erDiagram
    USER ||--o{ ENTITY : действие
\`\`\`

## 4. ПРИНЦИПЫ НАВИГАЦИИ
- Как пользователь попадает на каждую страницу
- Минимум шагов до ключевого действия`,

      userflow: `${ideaSection}Создай ПОЛНЫЕ пользовательские сценарии ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Предыдущий контекст:
${previousContext}

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Создай РЕАЛЬНЫЕ сценарии на основе контекста
- НЕ копируй описание идеи - генерируй НОВЫЕ сценарии
- Mermaid-диаграммы должны показывать конкретные шаги

## 1. ОСНОВНОЙ СЦЕНАРИЙ (Happy Path) - MERMAID
\`\`\`mermaid
flowchart TD
    A["📱 Открывает приложение"] --> B["🔍 Ищет товар"]
    B --> C["📄 Открывает карточку"]
    C --> D{"Нравится?"}
    D -->|Да| E["🛒 Добавляет в корзину"]
    D -->|Нет| B
    E --> F["💳 Оформляет заказ"]
    F --> G["✅ Получает подтверждение"]
    
    style A fill:#e0f2fe
    style G fill:#dcfce7
    style D fill:#fef3c7
\`\`\`

Детальное описание шагов:
1. **Открывает приложение** → Landings page, видит рекомендации
2. **Ищет товар** → Использует поиск или фильтры
...

## 2. АЛЬТЕРНАТИВНЫЕ СЦЕНАРИИ (3)
### Сценарий А: [Название]
- Предусловия
- Шаги (Mermaid + описание)
- Результат

### Сценарий Б: [Название]
...

### Сценарий В: [Название]
...

## 3. EDGE CASES
Что идёт не так?
- Товар закончился
- Оплата не прошла
- Сеть недоступна
Для каждого: сценарий обработки

## 4. ОПИСАНИЕ ЭКРАНОВ
Перечисли все экраны, вовлечённые в сценарии:
- **Экран 1**: цель, элементы, действия
- **Экран 2**: цель, элементы, действия
...

## 5. ПЕРЕХОДЫ МЕЖДУ ЭКРАНАМИ
Таблица: откуда → куда → триггер`,

      prototype: `${ideaSection}Создай ПОЛНЫЙ, ИНТЕРАКТИВНЫЙ HTML прототип ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Предыдущий контекст:
${previousContext}

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Создай РАБОЧИЙ HTML код с реальным контентом из идеи
- НЕ копируй описание идеи - генерируй HTML
- Используй конкретные данные из контекста продукта

ТРЕБОВАНИЯ К ДИЗАЙНУ:
- Тёмная тема: фон #0a0a0f, текст #ffffff
- Акцентный цвет: #f5b942 (янтарный)
- Tailwind CSS через CDN: <script src="https://cdn.tailwindcss.com"></script>
- Современный, чистый дизайн
- Адаптивность (mobile-first)
- Интерактивные элементы (hover, transitions)

СТРУКТУРА HTML:
\`\`\`html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Название продукта]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Кастомные стили */
  </style>
</head>
<body class="bg-[#0a0a0f] text-white min-h-screen">
  <!-- Header -->
  <header>...</header>
  
  <!-- Hero Section -->
  <section>...</section>
  
  <!-- Features/Services -->
  <section>...</section>
  
  <!-- CTA -->
  <section>...</section>
  
  <!-- Footer -->
  <footer>...</footer>
</body>
</html>
\`\`\`

ВЕРНИ ТОЛЬКО HTML КОД В БЛОКЕ \`\`\`html ... \`\`\``,

      invitation: `${ideaSection}Создай ПОЛНЫЙ скрипт приглашения на тестирование ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Прототип: ${githubRepoUrl || 'ссылка будет добавлена'}

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Создай РЕАЛЬНЫЕ тексты на основе контекста продукта
- НЕ копируй описание идеи - генерируй конкретные тексты приглашений

## 1. EMAIL-ПРИГЛАШЕНИЕ
Тема: [Конкретная тема письма]

Текст письма:
[Полный текст письма с приветствием, описанием продукта, приглашением, CTA и подписью]

## 2. СООБЩЕНИЕ ДЛЯ TELEGRAM/WHATSAPP
[Краткое, цепляющее сообщение с эмодзи]

## 3. ПОСТ ДЛЯ СОЦСЕТЕЙ
[Полный текст поста для Instagram/VK/LinkedIn с хештегами]

## 4. ПРОФИЛЬ ИДЕАЛЬНОГО УЧАСТНИКА
- Демография: [возраст, профессия, локация]
- Поведение: [как использует похожие продукты]
- Мотивация: [почему согласится участвовать]
- Скрининг вопросы: [3-5 вопросов для отбора]

## 5. ФОРМА ЗАПИСИ
Поля формы:
- [Поле 1]
- [Поле 2]
- [Поле 3]
...

## 6. КАЛЕНДАРЬ СЛОТОВ
Предложи расписание сессий (даты, время)`,

      guideline: `${ideaSection}Создай ПОЛНЫЙ ГАЙДЛАЙН юзабилити-тестирования ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Создай РЕАЛЬНЫЙ гайдлайн на основе контекста продукта
- НЕ копируй описание идеи - генерируй конкретные инструкции

## 1. ПОДГОТОВКА К ТЕСТИРОВАНИЮ
- Оборудование: [что нужно]
- Программное обеспечение: [какие инструменты]
- Помещение: [требования]
- Материалы: [что распечатать/подготовить]

## 2. СТРУКТУРА СЕССИИ (тайминг)
| Этап | Время | Действие |
|------|-------|----------|
| Приветствие | 2 мин | ... |
| ... | ... | ... |

Общее время: [XX минут]

## 3. СКРИПТ МОДЕРАТОРА
### Приветствие
"[Текст приветствия]"

### Инструкция
"[Текст инструкции для участника]"

### Завершение
"[Текст завершения]"

## 4. ЗАДАЧИ ДЛЯ ТЕСТИРОВАНИЯ (5 КОНКРЕТНЫХ ЗАДАЧ)
### Задача 1: [Название]
- **Сценарий**: "[Контекст для участника]"
- **Задание**: "[Что нужно сделать]"
- **Критерий успеха**: [Как понять, что выполнил]
- **Время**: [Ожидаемое время]

### Задача 2: [Название]
...

## 5. ПОСТ-ТЕСТ ИНТЕРВЬЮ
Вопросы:
1. [Вопрос о первом впечатлении]
2. [Вопрос о сложности]
3. [Вопрос о предпочтениях]
4. [Вопрос об улучшениях]
5. [Открытый вопрос]

## 6. ЧЕК-ЛИСТ НАБЛЮДАТЕЛЯ
- [ ] Участник понял задачу
- [ ] Не возникло проблем с навигацией
- [ ] Формы заполняются корректно
...

## 7. ШАБЛОН ПРОТОКОЛА
Таблица для записи наблюдений:

| Задача | Успех | Время | Комментарии |
|--------|-------|-------|-------------|
| 1 | ✅/❌ | XX сек | ... |`,

      metrics: `${ideaSection}Определи ПОЛНЫЙ набор продуктовых метрик ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Создай РЕАЛЬНЫЕ метрики на основе контекста продукта
- НЕ копируй описание идеи - генерируй конкретные метрики с формулами

## 1. СЕВЕРНАЯ МЕТРИКА (NORTH STAR)
**Метрика**: [Название]
**Определение**: [Что измеряет]
**Формула**: [Как считать]
**Целевое значение**: [К чему стремиться]
**Почему это главная метрика**: [Обоснование]

## 2. ACQUISITION МЕТРИКИ (Привлечение)
| Метрика | Формула | Цель | Частота |
|---------|---------|------|---------|
| CAC | ... | ... | ... |
| ... | ... | ... | ... |

## 3. ACTIVATION МЕТРИКИ (Активация)
| Метрика | Формула | Цель | Частота |
|---------|---------|------|---------|
| Activation Rate | ... | ... | ... |
| ... | ... | ... | ... |

## 4. RETENTION МЕТРИКИ (Удержание)
| Метрика | Формула | Цель | Частота |
|---------|---------|------|---------|
| Day 1 Retention | ... | ... | ... |
| Day 7 Retention | ... | ... | ... |
| Day 30 Retention | ... | ... | ... |
| Churn Rate | ... | ... | ... |

## 5. REVENUE МЕТРИКИ (Доход)
| Метрика | Формула | Цель | Частота |
|---------|---------|------|---------|
| ARPU | ... | ... | ... |
| LTV | ... | ... | ... |
| MRR/ARR | ... | ... | ... |

## 6. REFERRAL МЕТРИКИ (Рекомендации)
| Метрика | Формула | Цель | Частота |
|---------|---------|------|---------|
| NPS | ... | ... | ... |
| Viral Coefficient | ... | ... | ... |

## 7. ПРОДУКТОВЫЕ МЕТРИКИ (специфичные)
[Метрики, уникальные для этого типа продукта]

## 8. ДАШБОРД МЕТРИК
Опиши структуру дашборда:
- Верхний уровень: [ключевые метрики]
- Средний уровень: [детализация]
- Нижний уровень: [тренды]

## 9. РЕКОМЕНДАЦИИ ПО ОТСЛЕЖИВАНИЮ
- Инструменты: [Google Analytics, Mixpanel, Amplitude и т.д.]
- Частота review: [ежедневно/еженедельно/ежемесячно]
- Ответственные: [кто следит за метриками]`
    };
    
    let prompt = prompts[stageId] || '';
    
    if (refinement) {
      prompt += `\n\nДОПОЛНИТЕЛЬНОЕ УТОЧНЕНИЕ ОТ ПОЛЬЗОВАТЕЛЯ:\n${refinement}`;
    }
    
    return prompt;
  }, [githubRepoUrl]);

  // Process competitors stage with real web search
  const processCompetitorsStage = useCallback(async (
    formedIdea: string,
    refinement?: string
  ): Promise<{ response: string; isError?: boolean }> => {
    console.log('[CompetitorsStage] Starting real web search...');
    
    try {
      let userCompetitors: string[] = [];
      if (refinement) {
        const lines = refinement.split(/[,\n]/);
        userCompetitors = lines
          .map(l => l.trim())
          .filter(l => l.length > 2 && !l.startsWith('-') && !l.startsWith('•'))
          .slice(0, 5);
      }
      
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      
      const res = await fetch('/api/competitors-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: formedIdea,
          correction: refinement,
          userCompetitors
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      
      if (stopGenerationRef.current) {
        return { response: `## ⏹️ Остановлено пользователем`, isError: true };
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.analysis) {
        return { response: data.analysis };
      }
      
      throw new Error(data.error || 'Ошибка поиска конкурентов');
    } catch (error) {
      if ((error as Error).name === 'AbortError' || stopGenerationRef.current) {
        return { response: `## ⏹️ Остановлено пользователем`, isError: true };
      }
      
      console.error('[CompetitorsStage] Error:', error);
      return { 
        response: `## ⚠️ Ошибка поиска конкурентов\n\n${(error as Error).message}\n\nНажмите "Перегенерировать" чтобы попробовать снова.`, 
        isError: true 
      };
    }
  }, []);

  // Process single stage
  const processStage = useCallback(async (
    stageIndex: number,
    sourceText: string,
    formedIdea: string,
    previousContext: string,
    conversationId: string | null,
    refinement?: string
  ): Promise<{ response: string; conversationId: string | null; isError?: boolean }> => {
    const stage = pipelineStages[stageIndex];
    
    if (!stage) {
      return { response: 'Stage not found', conversationId: null, isError: true };
    }
    
    // Special handling for competitors stage
    if (stage.id === 'competitors') {
      const result = await processCompetitorsStage(formedIdea, refinement);
      return { response: result.response, conversationId: null, isError: result.isError };
    }
    
    const prompt = buildPrompt(stage.id, sourceText, formedIdea, previousContext, refinement);
    
    // Map stage IDs to agent types for correct fallback handling
    const stageToAgent: Record<string, string> = {
      idea: 'transcription_analyst',
      competitors: 'brand_marketer',
      cjm: 'cjm_researcher',
      ia: 'ia_architect',
      userflow: 'userflow_researcher',
      prototype: 'prototyper',
      invitation: 'task_architect',
      guideline: 'task_architect',
      metrics: 'transcription_analyst'
    };
    
    const agentType = stageToAgent[stage.id] || 'transcription_analyst';
    
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (stopGenerationRef.current) {
        throw new Error('Generation stopped by user');
      }
      
      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentType,
            message: prompt,
            conversationId
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        abortControllerRef.current = null;

        if (stopGenerationRef.current) {
          return { response: `## ⏹️ Остановлено пользователем`, conversationId: null, isError: true };
        }

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error');
          console.error(`API error ${res.status}: ${errorText.substring(0, 200)}`);
          
          if (res.status === 502 || res.status === 504) {
            lastError = new Error(`Gateway error ${res.status}, retrying...`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Non-JSON response:', text.substring(0, 500));
          throw new Error('Server returned non-JSON response');
        }

        const data = await res.json();
        
        if (data.success && data.response) {
          return { response: data.response, conversationId: data.conversationId };
        }
        
        throw new Error(data.error || 'Ошибка обработки');
      } catch (error) {
        if ((error as Error).name === 'AbortError' || stopGenerationRef.current) {
          return { response: `## ⏹️ Остановлено пользователем`, conversationId: null, isError: true };
        }
        
        lastError = error as Error;
        console.error(`Error in processStage for ${stage.id} (attempt ${attempt}):`, error);
        
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    
    return { 
      response: `## ⚠️ Ошибка обработки этапа "${stage.fullName}"\n\n${lastError?.message || 'Неизвестная ошибка'}\n\nНажмите \"Перегенерировать\" чтобы попробовать снова.`, 
      conversationId: null,
      isError: true
    };
  }, [pipelineStages, buildPrompt, processCompetitorsStage]);

  // Main pipeline processing
  const processPipeline = useCallback(async (startIndex: number = 0) => {
    const fullText = sourceText || transcriptionText || inputText.trim();
    console.log('processPipeline called with startIndex:', startIndex, 'fullText length:', fullText?.length || 0);
    
    if (!fullText) {
      console.log('No source text, returning');
      return;
    }

    setIsProcessing(true);
    stopGenerationRef.current = false;
    setIsStopped(false);
    
    if (startIndex === 0) {
      // Save source text for future stages
      setSourceText(fullText);
      setCurrentStage(0);
      setGithubRepoUrl(null);
      
      // Detect product type and get stages
      const stages = await detectAndFetchStages(fullText);
      setPipelineStages(stages);
      
      // Initialize results for all stages
      setStageResults(stages.map(stage => ({
        id: stage.id,
        name: stage.name,
        status: 'pending',
        content: ''
      })));
    }

    let conversationId = null;
    let formedIdea = stageResults[0]?.content || '';
    let allResults: string[] = [];

    // Build allResults from completed stages
    for (let i = 0; i < startIndex; i++) {
      const result = stageResults[i];
      if (result?.content) {
        allResults.push(`=== ${pipelineStages[i]?.fullName?.toUpperCase() || 'STAGE'} ===\n${result.content}`);
      }
    }

    // Process ONLY ONE stage at a time
    const i = startIndex;
    
    if (stopGenerationRef.current) {
      console.log('STOP DETECTED at start of stage', i);
      return;
    }
    
    if (stageResults[i]?.status === 'completed') {
      console.log('Stage already completed, skipping');
      return;
    }
    
    const stage = pipelineStages[i];
    if (!stage) {
      console.log('No stage at index', i);
      setIsProcessing(false);
      return;
    }
    
    setCurrentStage(i);
    
    setStageResults(prev => prev.map((r, idx) => 
      idx === i ? { ...r, status: 'processing' } : r
    ));
    
    await new Promise(r => setTimeout(r, 100));
    if (stopGenerationRef.current) {
      console.log('STOP DETECTED after status update');
      setStageResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'error', content: '⏹️ Остановлено пользователем' } : r
      ));
      setIsProcessing(false);
      return;
    }

    try {
      const previousContext = allResults.join('\n\n');
      const stageInput = stageInputTexts[stage.id] || '';
      
      const result = await processStage(
        i, 
        fullText, 
        formedIdea, 
        previousContext,
        conversationId,
        stageInput
      );
      conversationId = result.conversationId;
      
      if (stopGenerationRef.current) {
        console.log('STOP DETECTED after processStage');
        setStageResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', content: '⏹️ Остановлено пользователем' } : r
        ));
        setIsProcessing(false);
        return;
      }
      
      if (stage.id === 'idea' && !result.isError) {
        formedIdea = result.response;
        setFormedIdeaSummary(extractIdeaSummary(result.response));
      }
      
      let githubUrl = null;
      
      if (stage.id === 'prototype') {
        setIsPublishing(true);
        const htmlMatch = result.response.match(/```html\n([\s\S]*?)\n```/);
        const html = htmlMatch ? htmlMatch[1] : result.response;
        const productName = extractProductName(formedIdea);
        
        try {
          const deployRes = await fetch('/api/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productName,
              htmlContent: html
            })
          });
          const deployData = await deployRes.json();
          if (deployData.success && deployData.deployment) {
            setVercelUrl(deployData.deployment.url);
            setAccessibilityScore(deployData.deployment.accessibilityScore);
            console.log('[Prototype] Deployed to:', deployData.deployment.url);
          }
        } catch (deployError) {
          console.error('[Prototype] Deploy error:', deployError);
        }
        
        githubUrl = await publishToGitHub(html, productName);
        if (githubUrl) setGithubRepoUrl(githubUrl);
        setIsPublishing(false);
      }
      
      const stageStatus = result.isError ? 'error' : 'completed';
      setStageResults(prev => prev.map((r, idx) => 
        idx === i ? { 
          ...r, 
          status: stageStatus, 
          content: result.response,
          githubUrl: githubUrl || undefined
        } : r
      ));
      
      setActiveResultTab(stage.id);
      
    } catch (error) {
      console.error(`Error in stage ${stage.id}:`, error);
      if (stopGenerationRef.current) {
        setStageResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', content: '⏹️ Остановлено пользователем' } : r
        ));
      } else {
        setStageResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', content: 'Ошибка при обработке' } : r
        ));
      }
    }

    setIsProcessing(false);
    setCurrentStage(-1);
    if (startIndex === 0) {
      setInputText('');
      handleRemoveFile();
    }
    setZoomLevel(100);
  }, [sourceText, transcriptionText, inputText, stageResults, stageInputTexts, pipelineStages, processStage, detectAndFetchStages]);

  // Stop generation
  const handleStopGeneration = () => {
    console.log('STOP PRESSED');
    stopGenerationRef.current = true;
    setIsStopped(true);
    setIsProcessing(false);
    setCurrentStage(-1);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setStageResults(prev => prev.map((r) => 
      r.status === 'processing' ? { ...r, status: 'error', content: '⏹️ Остановлено пользователем' } : r
    ));
  };

  // Continue from specific stage with user input
  const handleSendToNextStage = async (currentStageId: string) => {
    console.log('handleSendToNextStage called with:', currentStageId);
    
    const currentIndex = pipelineStages.findIndex(s => s.id === currentStageId);
    console.log('currentIndex:', currentIndex);
    
    if (currentIndex < 0) return;
    
    stopGenerationRef.current = false;
    setIsStopped(false);
    
    const currentResult = stageResults[currentIndex];
    const userInput = stageInputTexts[currentStageId] || '';
    
    if (userInput.trim() && currentResult) {
      const updatedContent = currentResult.content + `\n\n---\n**Дополнительные уточнения:**\n${userInput}`;
      setStageResults(prev => prev.map((r, idx) => 
        idx === currentIndex ? { ...r, content: updatedContent } : r
      ));
    }
    
    const nextIndex = currentIndex + 1;
    console.log('nextIndex:', nextIndex, 'pipelineStages.length:', pipelineStages.length);
    
    if (nextIndex < pipelineStages.length) {
      setStageInputTexts(prev => ({ ...prev, [currentStageId]: '' }));
      console.log('Calling processPipeline with startIndex:', nextIndex);
      await processPipeline(nextIndex);
    }
  };

  // Regenerate current stage with input
  const handleRegenerateStage = async (stageId: string) => {
    const stageIndex = pipelineStages.findIndex(s => s.id === stageId);
    if (stageIndex < 0) return;
    
    const userInput = stageInputTexts[stageId] || '';
    const formedIdea = stageResults[0]?.content || '';
    
    const previousContext = stageResults
      .slice(0, stageIndex)
      .map(r => `=== ${pipelineStages.find(s => s.id === r.id)?.fullName?.toUpperCase()} ===\n${r.content}`)
      .join('\n\n');
    
    setStageResults(prev => prev.map((r, idx) => 
      idx === stageIndex ? { ...r, status: 'processing' } : r
    ));
    
    const sourceText = transcriptionText || inputText;
    
    try {
      const result = await processStage(stageIndex, sourceText, formedIdea, previousContext, null, userInput);
      
      const stageStatus = result.isError ? 'error' : 'completed';
      setStageResults(prev => prev.map((r, idx) => 
        idx === stageIndex ? { ...r, status: stageStatus, content: result.response } : r
      ));
      
      if (stageId === 'idea' && !result.isError) {
        setFormedIdeaSummary(extractIdeaSummary(result.response));
      }
      
      setStageInputTexts(prev => ({ ...prev, [stageId]: '' }));
      
    } catch (error) {
      console.error('Error regenerating stage:', error);
      setStageResults(prev => prev.map((r, idx) => 
        idx === stageIndex ? { ...r, status: 'error', content: 'Ошибка при обработке. Попробуйте снова.' } : r
      ));
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadHTML = (content: string) => {
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    const html = htmlMatch ? htmlMatch[1] : content;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prototype.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProgress = () => {
    if (currentStage < 0) return 0;
    const completed = stageResults.filter(r => r.status === 'completed').length;
    return (completed / pipelineStages.length) * 100;
  };

  const resetPipeline = () => {
    setPipelineStages(DEFAULT_STAGES);
    setProductType(null);
    setProductTypeLabel(null);
    setStageResults([]);
    setActiveResultTab(null);
    setCurrentStage(-1);
    setZoomLevel(100);
    setGithubRepoUrl(null);
    setVercelUrl(null);
    setAccessibilityScore(null);
    setFormedIdeaSummary(null);
    setStageInputTexts({});
    setSourceText('');
    stopGenerationRef.current = false;
    setIsStopped(false);
    setIsProcessing(false);
    setAgentChatMessages({});
    setAgentChatInput('');
    setActiveChatStage(null);
  };

  // Agent Chat - send message to refine ANY agent result
  const handleAgentChatSend = async (stageId: string) => {
    if (!agentChatInput.trim() || isAgentChatProcessing) return;
    
    const userMessage = agentChatInput.trim();
    setAgentChatInput('');
    
    // Add message to the correct stage's chat history
    setAgentChatMessages(prev => ({
      ...prev,
      [stageId]: [...(prev[stageId] || []), { role: 'user', content: userMessage }]
    }));
    setIsAgentChatProcessing(true);
    
    try {
      // Get current stage content
      const stageResult = stageResults.find(r => r.id === stageId);
      const currentContent = stageResult?.content || '';
      
      // Get all previous artifacts for context
      const stageIndex = pipelineStages.findIndex(s => s.id === stageId);
      const previousArtifacts = stageResults
        .slice(0, stageIndex)
        .filter(r => r.status === 'completed')
        .map(r => `### ${r.name}\n${r.content.substring(0, 500)}...`)
        .join('\n\n---\n\n');
      
      // Determine agent type based on stage
      const agentTypeMap: Record<string, string> = {
        'idea': 'transcription_analyst',
        'competitors': 'brand_marketer',
        'cjm': 'cjm_researcher',
        'ia': 'ia_architect',
        'userflow': 'userflow_researcher',
        'prototype': 'prototyper',
        'invitation': 'task_architect',
        'guideline': 'task_architect',
        'metrics': 'task_architect'
      };
      
      const agentType = agentTypeMap[stageId] || 'transcription_analyst';
      
      console.log(`[Agent Chat] Stage: ${stageId}, Agent: ${agentType}`);
      console.log(`[Agent Chat] Current content length: ${currentContent.length}`);
      
      // Build prompt for refinement
      const prompt = `Текущий результат этапа "${stageId}":

${currentContent}

---

Запрос пользователя на изменение:
${userMessage}

---

Внеси запрошенные изменения в результат.
Важно:
- Внеси ТОЛЬКО запрошенные изменения
- Сохрани общую структуру и формат
- Сохрани Mermaid-диаграммы если они есть
- Отвечай на русском языке

${previousArtifacts ? `
Контекст предыдущих этапов:
${previousArtifacts.substring(0, 2000)}
` : ''}`;
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          message: prompt
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.response) {
        // Update the stage result
        const stageIdx = stageResults.findIndex(r => r.id === stageId);
        if (stageIdx >= 0) {
          setStageResults(prev => prev.map((r, idx) => 
            idx === stageIdx ? { ...r, content: data.response } : r
          ));
        }
        setAgentChatMessages(prev => ({
          ...prev,
          [stageId]: [...(prev[stageId] || []), { role: 'assistant', content: 'Результат обновлён! Изменения применены.' }]
        }));
      } else {
        throw new Error(data.error || 'Ошибка обработки');
      }
    } catch (error) {
      console.error('Agent Chat error:', error);
      setAgentChatMessages(prev => ({
        ...prev,
        [stageId]: [...(prev[stageId] || []), { role: 'assistant', content: 'Ошибка при обновлении. Попробуйте ещё раз.' }]
      }));
    } finally {
      setIsAgentChatProcessing(false);
    }
  };

  // Get chat messages for a specific stage
  const getStageChatMessages = (stageId: string) => agentChatMessages[stageId] || [];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoomLevel(100);

  const canContinueFromStage = (stageId: string) => {
    const idx = pipelineStages.findIndex(s => s.id === stageId);
    const result = stageResults[idx];
    const isLast = idx === pipelineStages.length - 1;
    const isCompleted = result?.status === 'completed';
    
    return idx >= 0 && !isLast && isCompleted;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">IntuiUX Agent</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {productTypeLabel ? `${productTypeLabel} → ` : 'От идеи → '}до прототипа
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isProcessing && (
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleStopGeneration}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Стоп
                </Button>
              )}
              
              {stageResults.length > 0 && !isProcessing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetPipeline}
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Новый анализ
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Input Section */}
        {stageResults.length === 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Этапы формируются по контексту идеи
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ваша идея → Готовый прототип
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Опишите идею продукта, AI определит тип и создаст нужные артефакты
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить файл
                </Button>
                
                {transcriptionFile && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-300 max-w-[200px] truncate">
                      {transcriptionFile.name}
                    </span>
                    <button onClick={handleRemoveFile} className="w-5 h-5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center">
                      <X className="w-3 h-3 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>

              <Textarea
                placeholder={transcriptionText ? "Текст загружен из файла..." : "Опишите вашу идею продукта..."}
                value={transcriptionText ? '' : inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!!transcriptionText}
                className="min-h-[200px] bg-[#0d0d14] border-white/10 focus:border-amber-500/50 text-white placeholder:text-gray-600 resize-none"
              />

              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-500">
                <span className="text-amber-400">Типы продуктов:</span>
                <span>E-commerce</span>
                <span>•</span>
                <span>SaaS</span>
                <span>•</span>
                <span>B2B</span>
                <span>•</span>
                <span>Блог</span>
                <span>•</span>
                <span>Landing</span>
                <span>•</span>
                <span>Dashboard</span>
                <span>•</span>
                <span>Booking</span>
                <span>•</span>
                <span>App</span>
              </div>

              <Button
                onClick={() => processPipeline(0)}
                disabled={(!inputText.trim() && !transcriptionText) || isProcessing}
                className="w-full mt-6 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {isPublishing ? 'Публикация...' : 'Обработка...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Создать прототип и выложить на GitHub
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {(isProcessing || isStopped) && stageResults.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  {isStopped ? '⏹️ Остановлено' : isPublishing ? 'Публикация на GitHub' : 'Обработка'}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {stageResults.filter(r => r.status === 'completed').length} / {pipelineStages.length}
                  </span>
                  {productTypeLabel && (
                    <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                      {productTypeLabel}
                    </span>
                  )}
                  {isProcessing && (
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={handleStopGeneration}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Стоп
                    </Button>
                  )}
                </div>
              </div>
              <Progress value={getProgress()} className="h-2 bg-white/10" />
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-amber-400">
                  {isStopped ? 'Обработка остановлена' : isPublishing ? 'Загрузка прототипа...' : 
                   currentStage >= 0 ? pipelineStages[currentStage]?.fullName : 'Подготовка...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GitHub URL Banner */}
        {githubRepoUrl && !isProcessing && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-medium text-white">Прототип опубликован!</p>
                  <p className="text-sm text-gray-400 truncate max-w-[300px]">{githubRepoUrl}</p>
                </div>
              </div>
              <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors">
                <ExternalLink className="w-4 h-4" />
                Открыть
              </a>
            </div>
          </div>
        )}

        {/* Results Section */}
        {stageResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-2">
                {pipelineStages.map((stage, idx) => {
                  const result = stageResults[idx];
                  const IconComponent = stage.icon;
                  
                  return (
                    <button
                      key={stage.id}
                      onClick={() => result?.status === 'completed' && setActiveResultTab(stage.id)}
                      disabled={result?.status !== 'completed'}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        activeResultTab === stage.id 
                          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30' 
                          : result?.status === 'completed'
                            ? 'hover:bg-white/5 cursor-pointer border border-transparent'
                            : 'opacity-50 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center shrink-0`}>
                        {result?.status === 'processing' ? (
                          <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        ) : result?.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : result?.status === 'error' ? (
                          <Circle className="w-4 h-4 text-red-400" />
                        ) : (
                          <IconComponent className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate">{stage.name}</div>
                        <div className="text-xs text-gray-500">
                          {result?.status === 'processing' ? 'Обработка...' : result?.status === 'completed' ? 'Готово' : 'Ожидание'}
                        </div>
                      </div>
                      {stage.isOptional && (
                        <span className="text-xs text-gray-500">опц.</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeResultTab && (
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                  {/* Idea Banner */}
                  {formedIdeaSummary && activeResultTab !== 'idea' && (
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-amber-300">{formedIdeaSummary.name}</p>
                          {formedIdeaSummary.description && (
                            <p className="text-xs text-gray-400 truncate">{formedIdeaSummary.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Header */}
                  <div className="border-b border-white/10 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const stage = pipelineStages.find(s => s.id === activeResultTab);
                            const IconComponent = stage?.icon || Sparkles;
                            return (
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stage?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                            );
                          })()}
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {pipelineStages.find(s => s.id === activeResultTab)?.fullName}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {pipelineStages.find(s => s.id === activeResultTab)?.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegenerateStage(activeResultTab)}
                            disabled={isProcessing}
                            className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Перегенерировать
                          </Button>
                          
                          {activeResultTab === 'prototype' && stageResults.find(r => r.id === activeResultTab)?.content && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadHTML(stageResults.find(r => r.id === activeResultTab)?.content || '')}
                                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Скачать
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(
                                  stageResults.find(r => r.id === activeResultTab)?.content || '',
                                  'prototype'
                                )}
                                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                              >
                                {copiedCode === 'prototype' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copiedCode === 'prototype' ? 'Скопировано' : 'Копировать'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    {stageResults.find(r => r.id === activeResultTab)?.content ? (
                      <MessageContent 
                        content={stageResults.find(r => r.id === activeResultTab)?.content || ''} 
                        zoomLevel={zoomLevel}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>Содержимое загружается...</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Agent Chat Section - Show for all completed stages */}
                  {stageResults.find(r => r.id === activeResultTab)?.status === 'completed' && (
                    <div className="border-t border-white/10">
                      {/* Chat Toggle Button */}
                      <div className="p-3 bg-[#0d0d14] border-b border-white/5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveChatStage(activeChatStage === activeResultTab ? null : activeResultTab)}
                          className="w-full justify-start text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {activeChatStage === activeResultTab ? 'Скрыть чат уточнений' : 'Уточнить результат через чат'}
                        </Button>
                      </div>
                      
                      {/* Chat Messages */}
                      {activeChatStage === activeResultTab && (
                        <>
                          {getStageChatMessages(activeResultTab).length > 0 && (
                            <div className="max-h-64 overflow-y-auto p-4 space-y-3 bg-[#0d0d14]">
                              {getStageChatMessages(activeResultTab).map((msg, idx) => (
                                <div 
                                  key={idx} 
                                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                                    msg.role === 'user' 
                                      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-100' 
                                      : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100'
                                  }`}>
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Chat Input */}
                          <div className="p-4 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-cyan-400" />
                              <span className="text-sm font-medium text-cyan-400">Уточнить результат</span>
                            </div>
                            <div className="flex gap-2">
                              <Textarea
                                placeholder={`Опишите изменения для этапа "${activeResultTab}"...`}
                                value={agentChatInput}
                                onChange={(e) => setAgentChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAgentChatSend(activeResultTab);
                                  }
                                }}
                                className="min-h-[60px] bg-[#0d0d14] border-cyan-500/30 focus:border-cyan-500/50 text-white placeholder:text-gray-600 resize-none"
                                disabled={isAgentChatProcessing}
                              />
                              <Button
                                onClick={() => handleAgentChatSend(activeResultTab)}
                                disabled={!agentChatInput.trim() || isAgentChatProcessing}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold self-end"
                              >
                                {isAgentChatProcessing ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Агент внесёт запрошенные изменения в результат текущего этапа
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Send to Next Stage Button */}
                  {canContinueFromStage(activeResultTab) && (
                    <div className="border-t border-white/10 p-4 sm:p-6 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                      <div className="flex flex-col gap-4">
                        <Textarea
                          placeholder="Добавьте уточнения для следующего этапа (необязательно)..."
                          value={stageInputTexts[activeResultTab] || ''}
                          onChange={(e) => setStageInputTexts(prev => ({ ...prev, [activeResultTab]: e.target.value }))}
                          className="min-h-[80px] bg-[#0d0d14] border-white/10 focus:border-amber-500/50 text-white placeholder:text-gray-600 resize-none"
                        />
                        <Button
                          onClick={() => handleSendToNextStage(activeResultTab)}
                          disabled={isProcessing}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Отправить на следующий этап
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>IntuiUX Agent — AI-помощник для UX-дизайна</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Zuhlon/intuiux-agent" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                GitHub
              </a>
              <a href="https://intuiux-agent.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                Демо
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <div ref={resultsEndRef} />
    </div>
  );
}
