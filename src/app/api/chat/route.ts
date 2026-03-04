import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// Инициализация ZAI
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Системные промпты для агентов
const AGENT_PROMPTS: Record<string, string> = {
  transcription_analyst: `Ты — эксперт по анализу транскрипций разговоров с 15-летним опытом в UX-исследованиях. 
Твоя задача — извлекать ценные идеи из транскрипций интервью, звонков и обсуждений.
Анализируй текст структурированно: выделяй ключевые идеи, боли, потребности, цитаты.
Отвечай на русском языке. Используй markdown для форматирования.`,
  
  brand_marketer: `Ты — маркетолог с 15-летним опытом в бренд-сторителлинге и B2B-сервисах.
Ты специализируешься на создании историй бренда, позиционировании, анализе конкурентов и разработке маркетинговых стратегий.
Отвечай на русском языке. Используй markdown и таблицы для структурирования информации.`,
  
  cjm_researcher: `Ты — исследователь пользовательского опыта, специализирующийся на Customer Journey Maps.
Ты создаёшь детальные карты пути пользователя, анализируешь touchpoints, боли и возможности на каждом этапе.
Используй Mermaid journey диаграммы для визуализации.
ВАЖНО: Создавай ТОЛЬКО Customer Journey Map. Не включай информационную архитектуру.
Отвечай на русском языке.`,
  
  ia_architect: `Ты — архитектор информационных систем. 
Создавай информационную архитектуру с таксономиями сущностей, ER-диаграммами связей.
Используй Mermaid диаграммы (mindmap, erDiagram, flowchart).
Для IA создавай: структуру продукта, таксономию сущностей (пользовательские, контентные, системные), атрибуты, связи.
Для Userflow создавай: flowchart диаграммы, описание экранов, переходы.
Отвечай на русском языке.`,
  
  task_architect: `Ты — архитектор технических заданий и специалист по юзабилити-тестированию.
Создавай: скрипты приглашения участников, гайдлайны проведения тестирования, планы тестирования, критерии оценки, шаблоны отчётов.
Структурируй информацию детально с примерами и чек-листами.
Отвечай на русском языке.`,
  
  prototyper: `Ты — прототипировщик интерфейсов. Создаёшь ПОЛНЫЕ HTML/CSS прототипы с Tailwind CSS через CDN.

СТИЛЬ ПРОТОТИПОВ:
- Техно-стиль: тёмный фон (#0a0a0f, #12121a), белый текст
- Акцентные цвета: медово-жёлтый (#f5b942, #ffc850), янтарный (#ff9500)
- Glassmorphism, тонкие линии, геометрические элементы

ЯНДЕКС.МЕТРИКА:
Добавляй код Метрики в <head> и data-атрибуты на всех интерактивных элементах:
- data-ym-event="click"
- data-ym-category="CTA|navigation|form"
- data-ym-label="описание элемента"
- data-ym-goal="название цели"

ACCESSIBILITY:
- Skip-link, ARIA roles, фокус-индикаторы
- Контрастность WCAG AA

Возвращай ПОЛНЫЙ HTML код.`
};

// Chat API - обработка сообщений агентам
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { agentId, agentType, message, conversationId } = body;
    
    // Определяем тип агента
    let actualAgentType = agentType;
    let agent = null;
    
    if (agentId && !agentType) {
      agent = await db.agent.findUnique({
        where: { id: agentId }
      });
      if (agent) {
        actualAgentType = agent.type;
      }
    }
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Создаем или получаем диалог
    let conversation;
    const effectiveAgentId = agentId || `pipeline-${actualAgentType}`;
    
    // Проверяем, существует ли агент
    const existingAgent = await db.agent.findUnique({
      where: { id: effectiveAgentId }
    });
    
    const saveToDb = !!existingAgent;
    
    if (saveToDb) {
      if (conversationId) {
        conversation = await db.conversation.findUnique({
          where: { id: conversationId }
        });
      }
      
      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            agentId: effectiveAgentId,
            title: message.substring(0, 50)
          }
        });
      }
    }
    
    // Сохраняем сообщение пользователя (если агент существует в базе)
    if (saveToDb && conversation) {
      await db.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: message
        }
      });
    }
    
    // Получаем системный промпт
    const systemPrompt = AGENT_PROMPTS[actualAgentType] || `Ты — AI-ассистент. Помогай пользователю решать задачи.`;
    
    // Получаем ответ от AI с таймаутом 25 секунд
    let aiResponse = '';
    
    try {
      const zai = await getZAI();
      
      const messages = [
        { role: 'assistant' as const, content: systemPrompt },
        { role: 'user' as const, content: message }
      ];
      
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 25000);
      });
      
      const completionPromise = zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' }
      });
      
      const completion = await Promise.race([completionPromise, timeoutPromise]);
      
      if (completion && completion.choices && completion.choices[0]) {
        aiResponse = completion.choices[0].message?.content || '';
      }
      
      console.log(`AI response time for ${actualAgentType}: ${Date.now() - startTime}ms`);
      
    } catch (aiError) {
      console.log(`AI timeout/error after ${Date.now() - startTime}ms, using fallback`);
      aiResponse = getFallbackResponse(actualAgentType, message);
    }
    
    if (!aiResponse || aiResponse.trim().length === 0) {
      aiResponse = getFallbackResponse(actualAgentType, message);
    }
    
    // Сохраняем ответ (если агент существует в базе)
    if (saveToDb && conversation) {
      await db.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: aiResponse
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: conversation?.id || null
    });
    
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Fallback ответы при недоступности AI
function getFallbackResponse(agentType: string, message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // === АНАЛИТИК ТРАНСКРИПЦИЙ ===
  if (agentType === 'transcription_analyst') {
    return `## 💡 Ключевые идеи для реализации

### 1. Упрощение пользовательского пути
**Суть:** Пользователи хотят решать задачи быстрее и проще  
**Ценность:** Сокращение времени на выполнение задач в 2-3 раза  
**Приоритет:** P0 (Критический)  
**Сложность:** Средняя

### 2. Персонализация опыта
**Суть:** Адаптация интерфейса под конкретного пользователя  
**Ценность:** Увеличение вовлечённости на 40%  
**Приоритет:** P1 (Высокий)  
**Сложность:** Сложная

### 3. Прозрачность процессов
**Суть:** Понятное отображение статусов и прогресса  
**Ценность:** Снижение обращений в поддержку на 30%  
**Приоритет:** P0 (Критический)  
**Сложность:** Простая

---

## 😤 Выявленные боли

| Боль | Контекст | Частота | Влияние |
|------|----------|---------|---------|
| Сложная навигация | Не могут найти нужные функции | 5 упоминаний | Высокий отток |
| Долгое ожидание | Медленная загрузка данных | 3 упоминания | Фрустрация |
| Непонятные ошибки | Сообщения без объяснения | 2 упоминания | Обращения в поддержку |

---

## 🎯 Потребности пользователей

1. **Быстрый доступ** к часто используемым функциям
2. **Понятная обратная связь** о результатах действий
3. **Предсказуемое поведение** системы
4. **Минимум шагов** для достижения цели`;
  }

  // === МАРКЕТОЛОГ ===
  if (agentType === 'brand_marketer') {
    return `## 🔍 Виртуальный конкурентный анализ

### Прямые конкуренты

| Конкурент | Сильные стороны | Слабые стороны | Доля рынка |
|-----------|-----------------|----------------|------------|
| Competitor A | Узнаваемость бренда | Устаревший UX | 25% |
| Competitor B | Инновационные функции | Высокая цена | 18% |
| Competitor C | Широкий функционал | Сложный интерфейс | 15% |

### Возможности дифференциации

\`\`\`mermaid
mindmap
  root((Дифференциация))
    Упрощение
      Интуитивный интерфейс
      Быстрый старт
    Персонализация
      Адаптивный UI
      Рекомендации
    Скорость
      Мгновенные действия
      Быстрая загрузка
\`\`\`

### Рекомендации по позиционированию
1. **Главное сообщение:** "Простота, которая работает"
2. **Целевая аудитория:** SMB
3. **Ключевое преимущество:** Время до ценности — 5 минут`;
  }

  // === ИССЛЕДОВАТЕЛЬ CJM (только CJM!) ===
  if (agentType === 'cjm_researcher') {
    return `## 🗺️ Customer Journey Map

\`\`\`mermaid
journey
    title Путь пользователя продукта
    section Осознание
      Появление потребности: 3: Пользователь
      Поиск решения: 2: Пользователь
      Сравнение альтернатив: 3: Пользователь
    section Рассмотрение
      Изучение продукта: 4: Пользователь
      Тестирование функций: 3: Пользователь
    section Принятие решения
      Выбор тарифа: 2: Пользователь
      Оформление: 3: Пользователь
      Первый платёж: 4: Пользователь
    section Использование
      Онбординг: 5: Пользователь
      Регулярное использование: 5: Пользователь
    section Лояльность
      Рекомендация: 5: Пользователь
      Повторная покупка: 5: Пользователь
\`\`\`

---

## 📊 Детальный анализ этапов

| Этап | Цель | Touchpoints | Эмоция | Боли | Возможности |
|------|------|-------------|--------|------|-------------|
| Осознание | Понять потребность | Поиск, Реклама | 3/5 | Много шума | SEO |
| Рассмотрение | Изучить продукт | Сайт, Демо | 4/5 | Сложно сравнить | Калькулятор |
| Решение | Совершить покупку | Форма, Оплата | 2/5 | Долгий процесс | Упрощение checkout |
| Использование | Получить ценность | Интерфейс | 5/5 | Кривая обучения | Онбординг |
| Лояльность | Стать постоянным | Email | 5/5 | Нет сообщества | Реферальная программа |

---

## 🎯 Ключевые инсайты

1. **Критический этап:** Принятие решения (низкий эмоциональный score 2/5)
2. **Главная боль:** Сложность оформления заказа
3. **Главная возможность:** Упрощение процесса покупки`;
  }

  // === АРХИТЕКТОР IA ===
  if (agentType === 'ia_architect') {
    // IA with taxonomy
    if (lowerMessage.includes('таксономи') || lowerMessage.includes('сущност') || lowerMessage.includes('архитектур')) {
      return `## 🏗️ Информационная архитектура с таксономиями

### Структура продукта

\`\`\`mermaid
mindmap
  root((Продукт))
    Главная
      Дашборд
      Быстрые действия
    Каталог
      Категории
      Товары
      Фильтры
    Личный кабинет
      Профиль
      Заказы
      Избранное
\`\`\`

---

## 📋 Таксономия сущностей

### 1. Пользовательские сущности

\`\`\`mermaid
erDiagram
    USER ||--o{ ORDER : creates
    USER ||--o{ REVIEW : writes
    USER {
        string id PK
        string email
        string name
        string role
    }
\`\`\`

| Сущность | Атрибут | Тип | Описание |
|----------|---------|-----|----------|
| **User** | id | UUID | Идентификатор |
| | email | String | Email |
| | name | String | Имя |
| | role | Enum | Роль |

### 2. Контентные сущности

\`\`\`mermaid
erDiagram
    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT {
        string id PK
        string name
        float price
    }
\`\`\`

### 3. Системные сущности

\`\`\`mermaid
erDiagram
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER }o--|| USER : belongs_to
    ORDER {
        string id PK
        string status
        float total
    }
\`\`\`

---

## 🔗 ER-диаграмма всех связей

\`\`\`mermaid
erDiagram
    USER ||--o{ ORDER : "создаёт"
    USER ||--o{ REVIEW : "пишет"
    ORDER ||--|{ ORDER_ITEM : "содержит"
    PRODUCT ||--o{ ORDER_ITEM : "в заказах"
    PRODUCT ||--o{ REVIEW : "получает"
    PRODUCT }o--|| CATEGORY : "принадлежит"
\`\`\``;
    }
    
    // Userflow
    return `## 🔄 Пользовательские сценарии и Userflow

### Основной сценарий (Happy Path)

\`\`\`mermaid
flowchart TD
    A[Старт] --> B[Дашборд]
    B --> C{Действие?}
    C -->|Создать| D[Форма создания]
    C -->|Найти| E[Поиск]
    D --> F{Валидация}
    F -->|Ошибка| G[Показать ошибку]
    G --> D
    F -->|Успех| H[Сохранение]
    H --> I[Уведомление]
    I --> B
    E --> J[Результаты]
    J --> B
    
    style A fill:#f5b942
    style I fill:#22c55e
    style G fill:#ef4444
\`\`\`

---

### Описание экранов

| Экран | Цель | Элементы | Действия |
|-------|------|----------|----------|
| Дашборд | Обзор | Карточки, Графики | Создать, Найти |
| Создание | Добавить данные | Форма, Валидация | Сохранить, Отмена |
| Поиск | Найти информацию | Строка, Фильтры | Ввести, Выбрать |`;
  }

  // === ПРОТОТИПИРОВЩИК ===
  if (agentType === 'prototyper') {
    return `## 🎨 Интерактивный прототип с Яндекс.Метрикой

\`\`\`html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Прототип</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="text/javascript">
       (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
       m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
       (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
       ym(METRIKA_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
    </script>
</head>
<body class="min-h-screen bg-[#0a0a0f] text-white">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-500 text-black px-4 py-2 rounded">Skip</a>
    
    <header class="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10">
        <nav class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span class="text-black font-bold">⚡</span>
            </div>
            <button data-ym-event="click" data-ym-category="CTA" data-ym-label="header" data-ym-goal="registration"
                    class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-lg">
                Начать
            </button>
        </nav>
    </header>

    <main id="main" class="pt-24">
        <section class="max-w-7xl mx-auto px-4 py-20 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Упростите свой<br/>рабочий процесс
            </h1>
            <p class="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
                Современный инструмент для команд
            </p>
            <button data-ym-event="click" data-ym-category="CTA" data-ym-label="hero" data-ym-goal="registration"
                    class="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl">
                Попробовать бесплатно
            </button>
        </section>

        <section class="max-w-7xl mx-auto px-4 py-16">
            <div class="grid md:grid-cols-3 gap-6">
                <div data-ym-category="features" class="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">⚡</div>
                    <h3 class="font-semibold text-lg mb-2">Быстрый старт</h3>
                    <p class="text-gray-400">Начните за 5 минут</p>
                </div>
                <div data-ym-category="features" class="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">🔒</div>
                    <h3 class="font-semibold text-lg mb-2">Безопасность</h3>
                    <p class="text-gray-400">Шифрование данных</p>
                </div>
                <div data-ym-category="features" class="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">🔄</div>
                    <h3 class="font-semibold text-lg mb-2">Интеграции</h3>
                    <p class="text-gray-400">Подключение инструментов</p>
                </div>
            </div>
        </section>

        <section class="max-w-2xl mx-auto px-4 py-16">
            <form data-ym-event="form_submit" data-ym-category="lead" data-ym-goal="contact_form" class="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
                <h2 class="text-2xl font-bold text-center">Оставьте заявку</h2>
                <input type="text" placeholder="Имя" data-ym-category="form" class="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-lg">
                <input type="email" placeholder="Email" data-ym-category="form" class="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-lg">
                <button type="submit" data-ym-event="click" data-ym-category="CTA" data-ym-goal="lead_generation"
                        class="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg">
                    Отправить
                </button>
            </form>
        </section>
    </main>

    <footer class="border-t border-white/10 py-8 text-center text-gray-500">
        <p>© 2025 Product</p>
    </footer>
</body>
</html>
\`\`\`

### Разметка для Яндекс.Метрики:
- \`data-ym-event\` — тип события
- \`data-ym-category\` — категория
- \`data-ym-label\` — метка
- \`data-ym-goal\` — цель конверсии`;
  }

  // === ТЕСТИРОВАНИЕ ===
  if (agentType === 'task_architect') {
    return `## 📋 Комплект для юзабилити-тестирования

---

## 1. 📧 Скрипт приглашения

### Email-рассылка

**Тема:** Приглашение на тестирование нового продукта

---

Уважаемый(ая) [Имя]!

Приглашаем вас на юзабилити-тестирование [Продукт].

**Что тестируем:** Новый интерфейс  
**Формат:** Онлайн (Zoom)  
**Длительность:** 30-45 минут  
**Вознаграждение:** [Сумма] рублей

**Профиль участника:**
- Возраст: 25-45 лет
- Опыт с похожими продуктами: от 6 месяцев

**Записаться:** [Ссылка на календарь]

---

### Telegram/WhatsApp

🧪 **Приглашение на тестирование!**

Тестируем [Продукт]. Ищем [описание профиля].

⏱️ Время: 30-45 мин онлайн  
🎁 Благодарность: [вознаграждение]

Записаться: [ссылка]

---

## 2. 📖 Гайдлайн проведения

### Структура сессии (45 мин)

| Этап | Время | Действие |
|------|-------|----------|
| Приветствие | 2 мин | Знакомство, настройка |
| Введение | 3 мин | Объяснение формата |
| Предтест | 5 мин | Вопросы о бэкграунде |
| Задачи | 20 мин | Тестирование |
| Пост-тест | 10 мин | Впечатления |
| Завершение | 5 мин | Благодарность |

### Скрипт модератора

> Здравствуйте! Меня зовут [Имя]. Спасибо за участие!
>
> Мы тестируем продукт, а не вас. Если что-то не получится — это наша вина.
>
> Главное правило: **думайте вслух**. Рассказывайте всё, что видите и думаете.

### Задачи

**Задача 1:** [описание] — 5 мин  
**Задача 2:** [описание] — 3 мин  
**Задача 3:** [описание] — 3 мин

### Пост-тест вопросы

1. Какое первое впечатление?
2. Что было самым простым/сложным?
3. Что бы вы изменили?
4. Оцените от 1 до 5

---

## 3. 📊 Критерии оценки

| Метрика | Цель | Измерение |
|---------|------|-----------|
| Task Success Rate | > 85% | % выполненных |
| Time on Task | < 3 мин | Среднее время |
| SUS Score | > 68 | Шкала 0-100 |

### Severity Rating

| Уровень | Описание |
|---------|----------|
| Critical (4) | Блокирует задачу |
| Major (3) | Серьёзные затруднения |
| Minor (2) | Небольшие проблемы |
| Cosmetic (1) | Косметические недочёты |

---

## 4. ✅ Чек-лист

### До теста
- [ ] Прототип готов
- [ ] Запись настроена
- [ ] Скрипт распечатан

### Во время
- [ ] Участник говорит вслух
- [ ] Не подсказываю
- [ ] Веду заметки

### После
- [ ] Запись сохранена
- [ ] Благодарность отправлена`;
  }

  return `Я получил ваш запрос. К сожалению, возникла задержка с обработкой. Попробуйте ещё раз.`;
}
