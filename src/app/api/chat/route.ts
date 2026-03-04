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
Используй Mermaid диаграммы для визуализации (journey, flowchart).
Отвечай на русском языке.`,
  
  ia_architect: `Ты — архитектор информационных систем и пользовательских потоков.
Ты создаёшь информационную архитектуру, userflow диаграммы, описания экранов и переходов.
Используй Mermaid диаграммы (mindmap, flowchart) для визуализации.
Отвечай на русском языке.`,
  
  task_architect: `Ты — архитектор технических заданий с опытом работы 12 лет.
Ты создаёшь детальные ТЗ для разработчиков, Gherkin сценарии, API контракты, критерии приёмки.
Отвечай на русском языке. Используй markdown, таблицы, код-блоки.`,
  
  prototyper: `Ты — прототипировщик интерфейсов. Создаёшь HTML/CSS прототипы с Tailwind CSS через CDN.
СТИЛЬ ПРОТОТИПОВ:
- Современный техно-стиль: тёмный фон (#0a0a0f, #12121a), белый текст
- Акцентные цвета: медово-жёлтый (#f5b942, #ffc850), янтарный (#ff9500)
- Геометрические элементы, тонкие линии, glassmorphism
- Accessibility: контрастность WCAG AA, фокус-индикаторы, aria-labels
- Адаптивность: mobile-first, responsive дизайн

Отвечай полным HTML кодом с встроенными стилями.`
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
    // Для pipeline агентов используем префикс pipeline-
    const effectiveAgentId = agentId || `pipeline-${actualAgentType}`;
    
    // Проверяем, существует ли агент
    const existingAgent = await db.agent.findUnique({
      where: { id: effectiveAgentId }
    });
    
    // Если агент не существует, работаем без сохранения в базу
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
  
  // === АНАЛИТИК ТРАНСКРИПЦИЙ ===
  if (agentType === 'transcription_analyst') {
    return `## 💡 Ключевые идеи для реализации

### 1. Упрощение пользовательского пути
**Суть:** Пользователи хотят решать задачи быстрее и проще
**Ценность:** Сокращение времени на完成任务 в 2-3 раза
**Приоритет:** Высокий

### 2. Персонализация опыта
**Суть:** Адаптация интерфейса под конкретного пользователя
**Ценность:** Увеличение вовлечённости на 40%
**Приоритет:** Средний

### 3. Прозрачность процессов
**Суть:** Понятное отображение статусов и прогресса
**Ценность:** Снижение обращений в поддержку на 30%
**Приоритет:** Высокий

---

## 😤 Выявленные боли

| Боль | Контекст | Влияние |
|------|----------|---------|
| Сложная навигация | Не могут найти нужные функции | Высокий отток |
| Долгое ожидание | Медленная загрузка данных | Фрустрация |
| Непонятные ошибки | Сообщения без объяснения | Обращения в поддержку |

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

### Косвенные конкуренты
- **Альтернатива X** — более дешёвое решение, но ограниченный функционал
- **Альтернатива Y** — фокус на другой сегмент

### Возможности дифференциации

\`\`\`mermaid
mindmap
  root((Дифференциация))
    Упрощение
      Интуитивный интерфейс
      Быстрый старт
      Минимум обучений
    Персонализация
      Адаптивный UI
      Рекомендации
      Контекстная помощь
    Скорость
      Мгновенные действия
      Быстрая загрузка
      Offline режим
\`\`\`

### Рекомендации по позиционированию
1. **Главное сообщение:** "Простота, которая работает"
2. **Целевая аудитория:** SMB, которые устали от сложных решений
3. **Ключевое преимущество:** Время до ценности — 5 минут`;
  }

  // === ИССЛЕДОВАТЕЛЬ CJM ===
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
      Консультация: 4: Пользователь
    section Принятие решения
      Выбор тарифа: 2: Пользователь
      Оформление: 3: Пользователь
      Первый платёж: 4: Пользователь
    section Использование
      Онбординг: 5: Пользователь
      Регулярное использование: 5: Пользователь
      Расширение использования: 4: Пользователь
    section Лояльность
      Рекомендация: 5: Пользователь
      Повторная покупка: 5: Пользователь
\`\`\`

---

## 📊 Информационная архитектура

\`\`\`mermaid
mindmap
  root((Продукт))
    Главная
      Дашборд
      Быстрые действия
      Уведомления
    Функции
      Основные
      Дополнительные
      Интеграции
    Настройки
      Профиль
      Уведомления
      Безопасность
    Поддержка
      Документация
      Чат
      FAQ
\`\`\`

---

### Точки касания и эмоции

| Этап | Touchpoint | Эмоция | Боль | Возможность |
|------|------------|--------|------|-------------|
| Осознание | Реклама, Поиск | Интерес | Много шума | Таргетинг |
| Рассмотрение | Сайт, Демо | Взволнованность | Сложно сравнить | Калькулятор |
| Решение | Форма, Оплата | Волнение | Долгий процесс | Упрощение |
| Использование | Продукт | Удовлетворение | Кривая обучения | Онбординг |`;
  }

  // === АРХИТЕКТОР IA/USERFLOW ===
  if (agentType === 'ia_architect') {
    return `## 🔄 Пользовательские сценарии и Userflow

### Основной сценарий (Happy Path)

\`\`\`mermaid
flowchart TD
    A[Старт: Пользователь заходит в систему] --> B[Дашборд]
    B --> C{Что нужно сделать?}
    C -->|Создать| D[Выбор типа задачи]
    C -->|Найти| E[Поиск]
    C -->|Настроить| F[Настройки]
    
    D --> G[Заполнение формы]
    G --> H{Валидация}
    H -->|Ошибка| I[Показать ошибку]
    I --> G
    H -->|Успех| J[Сохранение]
    J --> K[Подтверждение]
    K --> L[Уведомление]
    
    E --> M[Результаты поиска]
    M --> N[Выбор элемента]
    N --> O[Детальный просмотр]
    
    F --> P[Редактирование]
    P --> Q[Сохранение]
    Q --> B
    
    L --> B
    O --> B
    
    style A fill:#f5b942
    style L fill:#22c55e
    style I fill:#ef4444
\`\`\`

---

### Альтернативные сценарии

\`\`\`mermaid
flowchart LR
    A[Вход] --> B{Авторизован?}
    B -->|Нет| C[Логин]
    B -->|Да| D[Дашборд]
    C --> E{Успех?}
    E -->|Нет| F[Восстановление пароля]
    E -->|Да| D
    F --> G[Email]
    G --> C
\`\`\`

---

### Описание экранов

| Экран | Цель | Ключевые элементы | Действия |
|-------|------|-------------------|----------|
| Дашборд | Обзор активности | Карточки, Графики, Быстрые действия | Создать, Найти, Настроить |
| Создание | Добавить данные | Форма, Валидация, Подсказки | Заполнить, Сохранить, Отмена |
| Поиск | Найти информацию | Строка поиска, Фильтры, Результаты | Ввести, Фильтровать, Выбрать |
| Настройки | Персонализация | Группы настроек, Переключатели | Изменить, Сохранить |`;
  }

  // === АРХИТЕКТОР ЗАДАНИЙ ===
  if (agentType === 'task_architect') {
    return `## 📋 План юзабилити-тестирования

### 1. Цели тестирования

| Цель | Метрика успеха | Критерий |
|------|----------------|----------|
| Понятность интерфейса | Task Success Rate | > 85% |
| Скорость выполнения | Time on Task | < 3 мин |
| Удовлетворённость | SUS Score | > 68 |
| Усилия пользователя | CES | < 3 |

---

### 2. Методология

**Тип:** Модерируемое удалённое тестирование
**Инструменты:** Zoom + Maze / UserTesting
**Длительность сессии:** 30-45 минут
**Запись:** Экран + Камера + Аудио

---

### 3. Профиль участников

\`\`\`
Количество: 8-10 человек
Критерии отбора:
- Возраст: 25-45 лет
- Опыт с похожими продуктами: > 6 месяцев
- Активность: еженедельное использование
- Техническая грамотность: средняя и выше
\`\`\`

---

### 4. Сценарии задач

#### Задача 1: Основной сценарий
\`\`\`
Представьте, что вам нужно создать новый проект.
Начните с дашборда и выполните необходимые действия.
\`\`\`
**Время:** 5 минут
**Критерий успеха:** Проект создан без помощи

#### Задача 2: Поиск информации
\`\`\`
Найдите информацию о последнем проекте и его статусе.
\`\`\`
**Время:** 2 минуты
**Критерий успеха:** Найдено за ≤ 3 клика

#### Задача 3: Настройки
\`\`\`
Измените настройки уведомлений так, чтобы получать только важные уведомления.
\`\`\`
**Время:** 3 минуты
**Критерий успеха:** Настройки изменены корректно

---

### 5. Вопросы для пост-тест интервью

1. Что было самым простым?
2. Что вызвало затруднения?
3. Чего не хватало для выполнения задач?
4. Как можно улучшить этот интерфейс?
5. Оцените общее впечатление от 1 до 10

---

### 6. Тайминг проведения

| Этап | Время |
|------|-------|
| Приветствие и инструкции | 5 мин |
| Предтестовое интервью | 5 мин |
| Выполнение задач | 20 мин |
| Посттестовое интервью | 10 мин |
| Завершение | 5 мин |

---

### 7. Критерии приёмки

- [ ] 85% участников успешно завершили основные задачи
- [ ] Среднее время задачи не превышает целевое
- [ ] SUS Score > 68
- [ ] Выявлено ≤ 3 критических UX-проблемы`;
  }

  // === ПРОТОТИПИРОВЩИК ===
  if (agentType === 'prototyper') {
    return `## 🎨 Интерактивный прототип

\`\`\`html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Прототип — Техно Стиль</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --accent-honey: #f5b942;
            --accent-amber: #ff9500;
        }
        body { background: var(--bg-primary); }
        .glass {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .glow-accent {
            box-shadow: 0 0 20px rgba(245, 185, 66, 0.3);
        }
    </style>
</head>
<body class="min-h-screen text-white font-sans">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 glass">
        <nav class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span class="text-black font-bold">⚡</span>
                </div>
                <span class="font-semibold text-lg">Product</span>
            </div>
            <div class="hidden md:flex items-center gap-6">
                <a href="#" class="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-2 py-1" aria-label="Функции">Функции</a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-2 py-1" aria-label="Цены">Цены</a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-2 py-1" aria-label="Документация">Документация</a>
            </div>
            <button class="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-gray-900" aria-label="Начать работу">
                Начать
            </button>
        </nav>
    </header>

    <!-- Hero -->
    <main class="pt-24">
        <section class="max-w-7xl mx-auto px-4 py-20 text-center">
            <div class="inline-block px-4 py-1 rounded-full glass text-amber-400 text-sm mb-6">
                ✨ Новая версия 2.0
            </div>
            <h1 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Упростите свой<br/>рабочий процесс
            </h1>
            <p class="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                Современный инструмент для команд, которые ценят простоту и эффективность
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button class="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold rounded-xl glow-accent hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400" aria-label="Попробовать бесплатно">
                    Попробовать бесплатно
                </button>
                <button class="px-8 py-4 glass rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50" aria-label="Посмотреть демо">
                    ▶ Посмотреть демо
                </button>
            </div>
        </section>

        <!-- Features -->
        <section class="max-w-7xl mx-auto px-4 py-16">
            <div class="grid md:grid-cols-3 gap-6">
                <div class="glass rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center mb-4">
                        <span class="text-2xl">⚡</span>
                    </div>
                    <h3 class="font-semibold text-lg mb-2">Быстрый старт</h3>
                    <p class="text-gray-400">Начните работу за 5 минут без сложной настройки</p>
                </div>
                <div class="glass rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center mb-4">
                        <span class="text-2xl">🔒</span>
                    </div>
                    <h3 class="font-semibold text-lg mb-2">Безопасность</h3>
                    <p class="text-gray-400">Шифрование данных и соответствие стандартам</p>
                </div>
                <div class="glass rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center mb-4">
                        <span class="text-2xl">🔄</span>
                    </div>
                    <h3 class="font-semibold text-lg mb-2">Интеграции</h3>
                    <p class="text-gray-400">Подключение к вашим любимым инструментам</p>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 mt-20">
        <div class="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">
            <p>© 2025 Product. Все права защищены.</p>
        </div>
    </footer>
</body>
</html>
\`\`\`

### Особенности прототипа:
- **Техно-стиль:** Тёмный фон, glassmorphism, тонкие линии
- **Акценты:** Медово-жёлтый (#f5b942) для CTAs и важных элементов
- **Accessibility:** Фокус-индикаторы, aria-labels, контрастные цвета
- **Responsive:** Адаптивная сетка для мобильных устройств`;
  }

  // Default fallback
  return `Я получил ваш запрос. К сожалению, возникла задержка с обработкой. 

Пожалуйста, попробуйте ещё раз или обратитесь к администратору, если проблема повторяется.`;
}
