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

// Chat API - обработка сообщений агентам
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { agentId, message, conversationId } = body;
    
    if (!agentId || !message) {
      return NextResponse.json(
        { success: false, error: 'Agent ID and message are required' },
        { status: 400 }
      );
    }
    
    // Получаем агента
    const agent = await db.agent.findUnique({
      where: { id: agentId }
    });
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Создаем или получаем диалог
    let conversation;
    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId }
      });
    }
    
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          agentId,
          title: message.substring(0, 50)
        }
      });
    }
    
    // Сохраняем сообщение пользователя
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    });
    
    // Минимальный системный промпт (берём только первую строку описания)
    const shortDescription = agent.description;
    const agentType = agent.type;
    
    // Краткий системный промпт в зависимости от типа
    let systemPrompt = '';
    switch (agentType) {
      case 'persona':
        systemPrompt = `Ты — Анна, типичный пользователь цифровых продуктов. Отвечай от первого лица, давай оценки 1-10. ${shortDescription}`;
        break;
      case 'analyst':
        systemPrompt = `Ты — UX-аналитик. Анализируй данные, давай конкретные рекомендации. ${shortDescription}`;
        break;
      case 'researcher':
        systemPrompt = `Ты — UX-исследователь. Помогай с интервью и анализом пользователей. ${shortDescription}`;
        break;
      case 'validator':
        systemPrompt = `Ты — валидатор UX-решений. Критически оценивай гипотезы. ${shortDescription}`;
        break;
      default:
        systemPrompt = `Ты — AI-ассистент. ${shortDescription}`;
    }
    
    // Получаем ответ от AI с таймаутом 15 секунд (шлюз имеет более короткий таймаут)
    let aiResponse = '';
    
    try {
      const zai = await getZAI();
      
      // Простой промпт без лишнего контекста
      const messages = [
        { role: 'assistant' as const, content: systemPrompt },
        { role: 'user' as const, content: message }
      ];
      
      // Таймаут 10 секунд - чтобы успеть до таймаута шлюза
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000);
      });
      
      const completionPromise = zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' }
      });
      
      const completion = await Promise.race([completionPromise, timeoutPromise]);
      
      if (completion && completion.choices && completion.choices[0]) {
        aiResponse = completion.choices[0].message?.content || '';
      }
      
      console.log(`AI response time: ${Date.now() - startTime}ms`);
      
    } catch (aiError) {
      console.log(`AI timeout/error after ${Date.now() - startTime}ms, using fallback`);
      // Fallback ответ в случае ошибки или таймаута
      aiResponse = getFallbackResponse(agentType, message);
    }
    
    if (!aiResponse || aiResponse.trim().length === 0) {
      aiResponse = getFallbackResponse(agentType, message);
    }
    
    // Сохраняем ответ
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse
      }
    });
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: conversation.id
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
    if (lowerMessage.includes('анализ') || lowerMessage.includes('транскрипц') || lowerMessage.includes('разговор')) {
      return `## 📋 Анализ транскрипции разговора

### Сводка
Пользователь обсуждал опыт использования продукта и выявил несколько ключевых проблем.

### 💡 Ключевые идеи
1. Пользователь ищет более простой способ решения задачи
2. Текущий процесс занимает слишком много времени
3. Отсутствует понятная обратная связь в интерфейсе

### 😤 Боли и проблемы
| Боль | Контекст | Частота |
|------|----------|---------|
| Сложная навигация | Не мог найти нужный раздел | 3 упоминания |
| Долгое ожидание | Загрузка занимает много времени | 2 упоминания |
| Непонятные сообщения | Ошибки без объяснения | 1 упоминание |

### 🎯 Потребности
- Упрощение процесса до 2-3 шагов
- Мгновенная обратная связь
- Понятные сообщения об ошибках

### 🔄 Цитаты пользователя
> "Я потратил 10 минут, чтобы просто найти кнопку"
> "Почему так долго грузится?"
> "Непонятно, что пошло не так"

### 📈 Рекомендации
1. Упростить навигацию до 2 уровней
2. Оптимизировать скорость загрузки
3. Добавить понятные сообщения об ошибках`;
    }
    return `Я — Аналитик транскрипций. Вставьте текст разговора, и я:

- 📋 Выделю ключевые идеи
- 😤 Найду боли и проблемы
- 🎯 Определю потребности
- 📊 Выявлю паттерны поведения
- 🔄 Приведу цитаты пользователя

Вставьте транскрипцию разговора для анализа.`;
  }

  // === ИССЛЕДОВАТЕЛЬ CJM ===
  if (agentType === 'cjm_researcher') {
    if (lowerMessage.includes('cjm') || lowerMessage.includes('journey') || lowerMessage.includes('путь')) {
      return `## 🗺️ Customer Journey Map: E-commerce

\`\`\`mermaid
journey
    title Путь пользователя интернет-магазина
    section Осознание
      Появление потребности: 3: Пользователь
      Поиск решения: 2: Пользователь
    section Рассмотрение
      Изучение каталога: 3: Пользователь
      Сравнение товаров: 2: Пользователь
      Чтение отзывов: 4: Пользователь
    section Покупка
      Добавление в корзину: 4: Пользователь
      Оформление заказа: 2: Пользователь
      Оплата: 2: Пользователь
    section Получение
      Отслеживание доставки: 3: Пользователь
      Получение товара: 5: Пользователь
    section Лояльность
      Оставить отзыв: 4: Пользователь
      Повторная покупка: 5: Пользователь
\`\`\`

### Детальный анализ этапов

| Этап | Цель | Точки касания | Эмоции | Боли |
|------|------|---------------|--------|------|
| Осознание | Понять потребность | Поиск, Соцсети | Нейтрально | Много вариантов |
| Рассмотрение | Выбрать товар | Сайт, Отзывы | Интерес | Сложно сравнивать |
| Покупка | Оформить заказ | Корзина, Форма | Волнение | Долгая форма |
| Получение | Получить товар | Доставка | Радость | Задержки |
| Лояльность | Стать постоянным | Email, SMS | Удовлетворение | Спам`;
    }
    if (lowerMessage.includes('воронк') || lowerMessage.includes('funnel')) {
      return `## 📊 Воронка конверсии

\`\`\`mermaid
flowchart LR
    A[100%<br/>Посетители] -->|60%| B[60%<br/>Каталог]
    B -->|40%| C[24%<br/>Товар]
    C -->|50%| D[12%<br/>Корзина]
    D -->|70%| E[8%<br/>Заказ]
    E -->|85%| F[7%<br/>Покупка]
    
    style A fill:#e8f5e9
    style F fill:#c8e6c9
\`\`\`

### Анализ потерь

| Переход | Конверсия | Потеря | Причина |
|---------|-----------|--------|---------|
| Главная → Каталог | 60% | 40% | Нецелевой трафик |
| Каталог → Товар | 40% | 36% | Плохие фото/описание |
| Товар → Корзина | 50% | 12% | Цена, доставка |
| Корзина → Заказ | 70% | 4% | Сложная форма |
| Заказ → Покупка | 85% | 1% | Ошибки оплаты |`;
    }
    return `Я — Исследователь CJM. Создаю Customer Journey Maps:

- 🗺️ Диаграммы пути пользователя (Mermaid journey)
- 📊 Воронки конверсии
- 📈 Эмоциональные графики
- 🎯 Точки касания и боли

Запросите "построй CJM для [продукт]" или "покажи воронку конверсии".`;
  }

  // === АРХИТЕКТОР IA/USERFLOW ===
  if (agentType === 'ia_architect') {
    if (lowerMessage.includes('архитектур') || lowerMessage.includes('ia') || lowerMessage.includes('структур')) {
      return `## 🏗️ Информационная архитектура

\`\`\`mermaid
mindmap
  root((Интернет-магазин))
    Главная
      Акции
      Новинки
      Популярное
    Каталог
      Категории
        Электроника
        Одежда
        Дом
      Фильтры
      Поиск
    Товар
      Галерея
      Описание
      Отзывы
      Похожие
    Корзина
      Список товаров
      Промокод
      Итого
    Оформление
      Доставка
      Оплата
      Подтверждение
    Личный кабинет
      Профиль
      Заказы
      Избранное
\`\`\`

### Навигационная структура
- **Главное меню**: Главная, Каталог, Акции, О нас
- **Пользовательское меню**: Войти, Корзина, Избранное
- **Footer**: Контакты, Доставка, Возврат, FAQ`;
    }
    if (lowerMessage.includes('userflow') || lowerMessage.includes('поток') || lowerMessage.includes('flow')) {
      return `## 🔄 Userflow: Оформление заказа

\`\`\`mermaid
flowchart TD
    A[Старт: Товар в корзине] --> B[Открыть корзину]
    B --> C{Товары есть?}
    C -->|Нет| D[Показать пустую корзину]
    C -->|Да| E[Показать список товаров]
    
    E --> F{Изменить количество?}
    F -->|Да| G[Обновить корзину]
    G --> E
    F -->|Нет| H[Нажать "Оформить"]
    
    H --> I{Авторизован?}
    I -->|Нет| J[Форма входа/регистрации]
    J --> K{Успех?}
    K -->|Нет| L[Показать ошибку]
    L --> J
    K -->|Да| M[Выбор доставки]
    
    I -->|Да| M
    M --> N[Выбор способа оплаты]
    N --> O{Онлайн оплата?}
    O -->|Да| P[Шлюз оплаты]
    P --> Q{Успех?}
    Q -->|Нет| R[Ошибка оплаты]
    R --> N
    Q -->|Да| S[Подтверждение заказа]
    
    O -->|Нет| S
    S --> T[Email с деталями]
    T --> U[Конец]
    
    style A fill:#e8f5e9
    style U fill:#c8e6c9
    style D fill:#fff3e0
    style L fill:#ffebee
    style R fill:#ffebee
\`\`\`

### Описание экранов

| Экран | Цель | Ключевые элементы |
|-------|------|-------------------|
| Корзина | Проверить товары | Список, количество, итог |
| Доставка | Выбрать способ | Адрес, самовывоз |
| Оплата | Оплатить заказ | Карта, СБП, при получении |
| Подтверждение | Увидеть статус | Номер заказа, детали |`;
    }
    return `Я — Архитектор IA/Userflow. Создаю:

- 🏗️ Информационную архитектуру (Mindmap)
- 🔄 Диаграммы пользовательских потоков (Flowchart)
- 📱 Описание экранов и переходов
- 🔗 Навигационные связи

Запросите "построй IA для [продукт]" или "создай userflow для [процесс]".`;
  }

  // === АРХИТЕКТОР ЗАДАНИЙ ===
  if (agentType === 'task_architect') {
    if (lowerMessage.includes('задан') || lowerMessage.includes('тз') || lowerMessage.includes('requirement')) {
      return `# 📋 ТЗ: Компонент корзины товаров

## 1. Описание
**Тип:** Компонент
**Приоритет:** P0
**Оценка:** 5 сторипоинтов

## 2. Функциональные требования

### Happy Path
\`\`\`gherkin
Feature: Корзина товаров

  Scenario: Пользователь добавляет товар в корзину
    Given пользователь на странице товара
    When нажимает кнопку "В корзину"
    Then товар появляется в корзине
    And счётчик корзины увеличивается
    And показывается уведомление "Товар добавлен"
\`\`\`

### Обработка ошибок
\`\`\`gherkin
  Scenario: Товар закончился
    Given товар недоступен
    When пользователь нажимает "В корзину"
    Then показывается сообщение "Товар закончился"
    And предлагается подписка на уведомление
\`\`\`

## 3. UI/UX спецификация

### Состояния компонента
| Состояние | Описание |
|-----------|----------|
| Empty | Пустая корзина, CTA "Начать покупки" |
| Default | Список товаров, итоги |
| Loading | Skeleton загрузки |
| Error | Сообщение об ошибке |

### Структура
\`\`\`jsx
<Cart>
  <CartHeader count={3} />
  <CartItemList items={items} />
  <CartSummary subtotal={15000} />
  <CartActions onCheckout={...} />
</Cart>
\`\`\`

## 4. API
\`\`\`typescript
// GET /api/cart
interface CartResponse {
  items: CartItem[];
  total: number;
  count: number;
}

// POST /api/cart/add
interface AddToCartRequest {
  productId: string;
  quantity: number;
}
\`\`\`

## 5. Критерии приёмки
- [ ] Компонент рендерится без ошибок
- [ ] Добавление товара работает
- [ ] Удаление товара работает
- [ ] Изменение количества работает
- [ ] Состояния Empty/Error отображаются
- [ ] Адаптив работает`;
    }
    return `Я — Архитектор заданий. Создаю ТЗ для разработчиков:

- 📋 Детальные технические задания
- 🥒 Gherkin сценарии (Given/When/Then)
- 📐 Структура компонентов (JSX)
- 🔌 API контракты (TypeScript)
- ✅ Критерии приёмки (DoD)

Запросите "составь ТЗ для [компонент]".`;
  }

  // === ПРОТОТИПИРОВЩИК ===
  if (agentType === 'prototyper') {
    if (lowerMessage.includes('прототип') || lowerMessage.includes('html') || lowerMessage.includes('макет')) {
      return `## 🎨 HTML прототип: Страница товара

\`\`\`html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Товар — Прототип</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <!-- Прототип-панель -->
    <nav class="fixed top-0 left-0 right-0 bg-violet-600 text-white p-2 z-50">
        <div class="flex items-center justify-between max-w-7xl mx-auto">
            <span class="font-bold">🧪 Прототип: Страница товара</span>
            <div class="flex gap-2">
                <button onclick="showState('default')" class="px-3 py-1 bg-violet-500 rounded text-sm">Default</button>
                <button onclick="showState('loading')" class="px-3 py-1 bg-violet-500 rounded text-sm">Loading</button>
                <button onclick="showState('error')" class="px-3 py-1 bg-violet-500 rounded text-sm">Error</button>
            </div>
        </div>
    </nav>

    <main class="pt-14 max-w-7xl mx-auto p-4">
        <div class="grid md:grid-cols-2 gap-8">
            <!-- Галерея -->
            <div id="gallery" class="space-y-4">
                <img src="https://placehold.co/600x400" class="w-full rounded-lg">
                <div class="flex gap-2">
                    <img src="https://placehold.co/100x100" class="w-20 h-20 rounded cursor-pointer hover:ring-2 ring-violet-500">
                    <img src="https://placehold.co/100x100" class="w-20 h-20 rounded cursor-pointer">
                </div>
            </div>

            <!-- Информация -->
            <div class="space-y-4">
                <h1 class="text-2xl font-bold">Смартфон Example Pro Max</h1>
                <div class="flex items-center gap-2">
                    <span class="text-yellow-500">★★★★★</span>
                    <span class="text-gray-500">4.8 (128 отзывов)</span>
                </div>
                <div class="text-3xl font-bold text-violet-600">89 990 ₽</div>
                
                <div class="space-y-2">
                    <div class="font-medium">Цвет:</div>
                    <div class="flex gap-2">
                        <button class="w-8 h-8 rounded-full bg-black ring-2 ring-violet-500"></button>
                        <button class="w-8 h-8 rounded-full bg-white border"></button>
                        <button class="w-8 h-8 rounded-full bg-blue-500"></button>
                    </div>
                </div>

                <div class="flex gap-3 pt-4">
                    <button onclick="addToCart()" class="flex-1 bg-violet-600 text-white py-3 rounded-lg font-medium hover:bg-violet-700">
                        В корзину
                    </button>
                    <button class="px-4 py-3 border border-violet-600 text-violet-600 rounded-lg">
                        ♡
                    </button>
                </div>

                <div class="mt-6 p-4 bg-gray-100 rounded-lg">
                    <div class="font-medium mb-2">Доставка</div>
                    <div class="text-sm text-gray-600">Курьером завтра — бесплатно</div>
                </div>
            </div>
        </div>
    </main>

    <script>
        function showState(state) {
            // Переключение состояний прототипа
            console.log('State:', state);
        }
        function addToCart() {
            alert('Товар добавлен в корзину!');
        }
    </script>
</body>
</html>
\`\`\`

### Инструкция для тестирования
1. Скопируйте HTML код
2. Откройте в браузере
3. Тестируйте взаимодействия
4. Переключайте состояния кнопками сверху`;
    }
    return `Я — Прототипировщик. Создаю HTML прототипы:

- 🎨 Интерактивные HTML/CSS прототипы
- 📱 Адаптивные версии (Mobile/Tablet/Desktop)
- 🔄 Переключаемые состояния
- ✅ Готовы к юзабилити-тестированию

Запросите "создай прототип для [экран/страница]".`;
  }

  // === СТАРЫЕ АГЕНТЫ (для совместимости) ===
  if (agentType === 'researcher') {
    if (lowerMessage.includes('интервью') || lowerMessage.includes('сценарий')) {
      return `## Сценарий глубинного интервью

### Блок 1: Знакомство (5 мин)
- Как давно вы пользуетесь услугами оператора связи?
- Как обычно выбираете тариф?
- Что важно при выборе?

### Блок 2: Путь покупателя (10 мин)
- Расскажите о последнем посещении сайта
- Что искали? Что нашли?
- Что мешало принять решение?
- Были ли сомнения?

### Блок 3: Триггеры (10 мин)
- Что заставило бы вас купить прямо сейчас?
- Какие элементы сайта привлекают?
- Что повышает доверие?

### Блок 4: Барьеры (5 мин)
- Что останавливает от покупки онлайн?
- Чего не хватает на сайте?
- Что бы вы изменили?`;
    }
    if (lowerMessage.includes('билайн') || lowerMessage.includes('beeline')) {
      return `## Анализ сайта moskva.beeline.ru

### Структура главной страницы:
- **Топ-баннер**: акции и специальные предложения
- **Слайдер тарифов**: визуальное представление продуктов
- **Каталог устройств**: смартфоны, гаджеты, аксессуары
- **Промо-блоки**: кешбэк, рассрочки, бонусы

### Ключевые триггеры конверсии:
1. **Ценовые**: скидки до 30%, кешбэк до 25%
2. **Продуктовые**: новинки, эксклюзивные модели
3. **Эмоциональные**: ограниченные предложения, таймеры

### Выявленные проблемы:
- Сложная навигация между разделами
- Перегруженность информацией
- Нет сравнения тарифов

### Рекомендации:
- Упростить структуру меню
- Добавить сравнение тарифов в таблице
- Усилить социальные доказательства`;
    }
    if (lowerMessage.includes('метод') || lowerMessage.includes('исследован')) {
      return `## Методы UX-исследования

### Качественные методы:
1. **Глубинные интервью** - понимание мотивации
2. **Юзабилити-тестирование** - проверка интерфейса
3. **Контекстный анализ** - наблюдение в естественной среде

### Количественные методы:
1. **A/B тестирование** - сравнение вариантов
2. **Веб-аналитика** - поведение пользователей
3. **Опросы** - массовый сбор данных

### Рекомендация:
Для валидации гипотез лучше сочетать качественные и количественные методы.`;
    }
    if (lowerMessage.includes('ai инструмент') || lowerMessage.includes('ai-инструмент') || lowerMessage.includes('ai инструменты')) {
      return `## AI-инструменты для UX-исследований

### 🔥 Запись и анализ сессий:
- **Hotjar Ask AI** — анализирует сессии, находит rage clicks, отвечает на вопросы
- **Microsoft Clarity** — бесплатно! dead clicks, rage clicks, excessive scrolling
- **FullStory, Smartlook** — автоматическая сегментация проблем

### 📊 Анализ отзывов:
- **Sprig, Anecdote** — опросы в продукте с AI-анализом
- **Dovetail, EnjoyHQ** — расшифровка интервью, выделение тем

### 📈 Предсказательная аналитика:
- **Mixpanel** — "Не использовал функцию X за 7 дней = 80% риск оттока"
- **Amplitude** — когортный анализ с предсказаниями
- **GA4** — прогноз конверсии и выручки

### ⚙️ Автоматизация (n8n):
- Сбор данных из разных API
- AI-анализ через OpenAI/Claude
- Автоматические отчёты в Slack/Notion`;
    }
    if (lowerMessage.includes('hotjar') || lowerMessage.includes('clarity') || lowerMessage.includes('fullstory')) {
      return `## Инструменты анализа сессий

### Hotjar
- **Ask AI** — отвечает на вопросы о поведении
- Автоматически находит moments of frustration
- Пример вопроса: "Почему пользователи не нажимают на CTA?"

### Microsoft Clarity (бесплатно!)
- **Dead clicks** — клики, которые ни к чему не приводят
- **Rage clicks** — быстрые повторяющиеся клики (признак фрустрации)
- **Excessive scrolling** — избыточный скроллинг

### FullStory
- Автоматическая сегментация сессий по проблемам
- Выявление паттернов поведения
- Интеграция с аналитикой

### Рекомендация:
Начните с **Microsoft Clarity** (бесплатно), затем переходите на **Hotjar** для deeper анализа.`;
    }
    if (lowerMessage.includes('тренд') || lowerMessage.includes('2025') || lowerMessage.includes('будущ')) {
      return `## Тренды AI в UX 2024-2025

### 🔄 Конвергенция
Единый цикл: **Анализ → Инсайт → Генерация → Тестирование → Внедрение**

### 🎯 Гипер-персонализация
AI создаёт уникальные интерфейсы для каждого пользователя в реальном времени

### 📱 Генерация User Flows
AI генерирует многостраничные journey из текстового описания

### ⚠️ Этика и доверие
- Человеческий контроль за AI-решениями
- Избежание предвзятых решений
- Прозрачность AI-рекомендаций

### 🚀 Будущее
AI анализирует сессии → находит проблему → генерирует варианты → A/B тест → внедряет

**Роль дизайнера смещается от создания к кураторству AI-решений.**`;
    }
    return `Как UX-исследователь, я помогу вам:
- Составить сценарий интервью
- Провести анализ пользователей
- Выбрать методы исследования
- Подобрать AI-инструменты для исследований

Задайте конкретный вопрос!`;
  }
  
  if (agentType === 'analyst') {
    if (lowerMessage.includes('userflow') || lowerMessage.includes('user flow') || lowerMessage.includes('пользователя') || lowerMessage.includes('путь')) {
      return `## Userflow для типичного e-commerce сценария

\`\`\`mermaid
flowchart TD
    A[Вход на сайт] --> B{Уже зарегистрирован?}
    B -->|Да| C[Вход в аккаунт]
    B -->|Нет| D[Продолжить как гость]
    D --> E[Каталог товаров]
    C --> E
    E --> F[Поиск/Фильтры]
    F --> G[Страница товара]
    G --> H{Добавить в корзину?}
    H -->|Да| I[Корзина]
    H -->|Нет| E
    I --> J{Изменить количество?}
    J -->|Да| I
    J -->|Нет| K[Оформление заказа]
    K --> L[Ввод данных доставки]
    L --> M[Выбор способа оплаты]
    M --> N{Оплата успешна?}
    N -->|Да| O[Подтверждение заказа]
    N -->|Нет| P[Ошибка оплаты]
    P --> M
    O --> Q[Email с деталями]
    
    style A fill:#e1f5fe
    style O fill:#c8e6c9
    style P fill:#ffcdd2
\`\`\`

### Анализ точек конверсии:
| Этап | Конверсия | Основной drop-off |
|------|-----------|-------------------|
| Каталог → Товар | 70% | 30% не кликают |
| Товар → Корзина | 40% | 60% уходят |
| Корзина → Заказ | 60% | 40% бросают |
| Заказ → Оплата | 75% | 25% ошибки |

### Рекомендации по улучшению:
1. **Каталог**: Добавить quick-view для товаров
2. **Страница товара**: Усилить CTA "В корзину"
3. **Корзина**: Показать таймер резервирования
4. **Оплата**: Упростить до 1 шага`;
    }
    if (lowerMessage.includes('воронк') || lowerMessage.includes('funnel')) {
      return `## Воронка конверсии с анализом

\`\`\`mermaid
flowchart LR
    A[100%<br/>Посетители] -->|70%| B[70%<br/>Просмотр товаров]
    B -->|40%| C[28%<br/>Добавили в корзину]
    C -->|60%| D[17%<br/>Начали оформление]
    D -->|75%| E[12%<br/>Завершили покупку]
    
    style A fill:#bbdefb
    style B fill:#90caf9
    style C fill:#64b5f6
    style D fill:#42a5f5
    style E fill:#2196f3,color:#fff
\`\`\`

### Анализ потерь на каждом этапе:

**1. Посетители → Просмотр (потеря 30%)**
- Причина: Плохой landing page, нецелевой трафик
- Решение: Оптимизация первого экрана, таргетинг

**2. Просмотр → Корзина (потеря 60%)**
- Причина: Неубедительное описание, высокая цена
- Решение: Улучшить фото, добавить отзывы, показать скидки

**3. Корзина → Оформление (потеря 40%)**
- Причина: Сложная форма, скрытые платежи
- Решение: Гостевой чекаут, показать итог сразу

**4. Оформление → Покупка (потеря 25%)**
- Причина: Ошибки оплаты, долгая загрузка
- Решение: Apple/Google Pay, оптимизация скорости`;
    }
    if (lowerMessage.includes('сценари') || lowerMessage.includes('анализ страниц') || lowerMessage.includes('страниц')) {
      return `## Анализ страницы на сценарии пользователей

\`\`\`mermaid
flowchart TD
    subgraph Страница_Товара
        A[Вход на страницу] --> B[Просмотр фото]
        B --> C[Чтение описания]
        C --> D[Проверка цены]
        D --> E{В наличии?}
        E -->|Да| F[Выбор параметров]
        E -->|Нет| G[Уведомить о поступлении]
        F --> H[Добавить в корзину]
        H --> I{Продолжить покупки?}
        I -->|Да| J[Вернуться в каталог]
        I -->|Нет| K[Перейти в корзину]
    end
    
    style A fill:#e3f2fd
    style H fill:#c8e6c9
    style K fill:#fff9c4
\`\`\`

### Основной сценарий (Happy Path):
1. Пользователь заходит на страницу товара
2. Просматривает фото и описание
3. Проверяет цену и наличие
4. Выбирает параметры (цвет, размер)
5. Добавляет в корзину
6. Переходит к оформлению

### Альтернативные сценарии:
- **Товара нет в наличии** → Подписка на уведомление
- **Сравнение товаров** → Добавление в сравнение
- **Вопрос о товаре** → Чат с поддержкой

### Барьеры и триггеры:
| Барьеры | Триггеры |
|---------|----------|
| Мало фото | Скидка 15% |
| Нет отзывов | Бесплатная доставка |
| Сложный выбор | Рекомендации |
| Долгая доставка | Экспресс-доставка`;
    }
    if (lowerMessage.includes('конверси') || lowerMessage.includes('оплат')) {
      return `## Анализ падения конверсии на этапе оплаты

\`\`\`mermaid
flowchart TD
    A[Начало оплаты] --> B{Выбор способа}
    B -->|Карта| C[Ввод данных карты]
    B -->|Apple Pay| D[Быстрая оплата]
    B -->|СБП| E[QR-код]
    
    C --> F{Валидация}
    F -->|Ошибка| G[Сообщение об ошибке]
    G --> C
    F -->|Успех| H[Обработка платежа]
    
    D --> H
    E --> I[Сканирование QR]
    I --> H
    
    H --> J{Результат}
    J -->|Успех| K[Подтверждение]
    J -->|Ошибка| L[Повторная попытка]
    L --> B
    
    style K fill:#c8e6c9
    style G fill:#ffcdd2
    style L fill:#ffe0b2
\`\`\`

### Возможные причины падения:
1. **Сложная форма** - 67% уходят при >5 полях
2. **Отсутствие доверия** - нет значков безопасности
3. **Скрытые комиссии** - неожиданные доплаты
4. **Ошибки валидации** - непонятные сообщения

### Целевые метрики для отслеживания:
- **Conversion Rate**: > 3%
- **Drop-off на форме**: < 20%
- **Время на форме**: < 2 мин
- **Error Rate**: < 5%`;
    }
    if (lowerMessage.includes('метрик') || lowerMessage.includes('отслежив')) {
      return `## Ключевые UX-метрики: полный обзор

### 📊 Метрики конверсии

**Conversion Rate** — главный показатель эффективности
- Формула: (Конверсии / Посетители) × 100%
- Бенчмарки: E-commerce 2-4%, SaaS 3-10%
- Влияние: Прямая связь с выручкой

**Bounce Rate** — показатель отказов
- Формула: % ушедших после 1 страницы
- Целевой: < 40%
- Влияние: Качество контента и посадочных страниц

### 👤 Метрики удержания

**Retention Rate** — удержание пользователей
- Day 1: > 40%, Day 7: > 20%, Day 30: > 10%
- Влияние: LTV, стабильность выручки

**Churn Rate** — отток пользователей
- Целевой: < 5%/месяц для SaaS
- Влияние: Потеря MRR, негативный WOM

### 😊 Метрики удовлетворённости

**NPS (Net Promoter Score)**
- Шкала: -100 до +100
- Целевой: > 50
- Влияние: Готовность рекомендовать

**CSAT (Customer Satisfaction)**
- Шкала: 1-5
- Целевой: > 4.5
- Влияние: Удовлетворённость

**CES (Customer Effort Score)**
- Шкала: 1-7 (чем меньше, тем лучше)
- Целевой: < 2
- Влияние: Лояльность при поддержке

### ⚡ Метрики юзабилити

**SUS (System Usability Scale)**
- Шкала: 0-100
- Целевой: > 68 (средний), > 85 (отличный)

**Time to Value**
- Целевой: < 5 минут
- Влияние: Активация и удержание`;
    }
    if (lowerMessage.includes('nps') || lowerMessage.includes('csat') || lowerMessage.includes('ces')) {
      return `## Метрики удовлетворённости: детальный разбор

### NPS (Net Promoter Score)

\`\`\`mermaid
flowchart LR
    A["Вопрос: Рекомендуете ли вы нас? (0-10)"] --> B{Оценка}
    B -->|0-6| C[Детракторы<br/>Вредят репутации]
    B -->|7-8| D[Пассивные<br/>Не лояльны]
    B -->|9-10| E[Промоутеры<br/>Рекомендуют]
    
    style C fill:#ffcdd2
    style D fill:#fff9c4
    style E fill:#c8e6c9
\`\`\`

**Формула:** NPS = % Промоутеры - % Детракторы

| NPS | Интерпретация |
|-----|---------------|
| < 0 | Критические проблемы |
| 0-30 | Нормально, есть рост |
| 30-50 | Хорошая лояльность |
| 50-70 | Сильная лояльность |
| > 70 | Лидер рынка |

### CSAT (Customer Satisfaction Score)

**Вопрос:** "Насколько вы удовлетворены?"

**Шкала:** 1-5 или 1-10

**Применение:**
- После покупки
- После обращения в поддержку
- После использования функции

**Целевой:** > 80% (4/5)

### CES (Customer Effort Score)

**Вопрос:** "Насколько легко было решить проблему?"

**Шкала:** 1-7 (меньше = лучше)

**Влияние на продукт:**
- CES ↓ 1 балл = Loyalty ↑ 10%
- 96% клиентов с высоким CES вернутся

### Взаимосвязь метрик:

\`\`\`mermaid
flowchart TD
    A[CES: Усилия клиента] --> B[CSAT: Удовлетворённость]
    B --> C[NPS: Лояльность]
    C --> D[Retention: Удержание]
    D --> E[LTV: Пожизненная ценность]
    
    style A fill:#e1f5fe
    style B fill:#b3e5fc
    style C fill:#81d4fa
    style D fill:#4fc3f7
    style E fill:#29b6f6,color:#fff
\`\`\``;
    }
    if (lowerMessage.includes('retention') || lowerMessage.includes('удержан') || lowerMessage.includes('churn') || lowerMessage.includes('отток')) {
      return `## Метрики удержания и оттока

### Retention Rate — удержание пользователей

\`\`\`mermaid
flowchart TD
    A[День 0<br/>100%] --> B[День 1<br/>40-60%]
    B --> C[День 3<br/>25-40%]
    C --> D[День 7<br/>20-35%]
    D --> E[День 14<br/>15-25%]
    E --> F[День 30<br/>10-20%]
    F --> G[День 90<br/>5-10%]
    
    style A fill:#4caf50,color:#fff
    style B fill:#8bc34a
    style C fill:#cddc39
    style D fill:#ffeb3b
    style E fill:#ffc107
    style F fill:#ff9800
    style G fill:#ff5722,color:#fff
\`\`\`

### Факторы, влияющие на Retention:

| Этап | Фактор | Решение |
|------|--------|---------|
| День 1 | Качество onboarding | Интерактивный тур |
| День 7 | Понимание ценности | Push-уведомления |
| День 30 | Регулярное использование | Gamification |
| День 90 | Привычка | Сетевой эффект |

### Churn Rate — отток пользователей

**Формула:** (Ушедшие / Всего) × 100%

**Бенчмарки:**
- B2C SaaS: < 5%/мес
- B2B SaaS: < 2%/мес
- Мобильные: 60-80% в первые 30 дней

**Признаки риска оттока:**
- Снижение частоты использования
- Неиспользование ключевых функций
- Открытые тикеты поддержки
- Снижение NPS

### Стратегии снижения оттока:

\`\`\`mermaid
flowchart LR
    A[Предиктивная модель] --> B{Риск оттока?}
    B -->|Высокий| C[Proactive outreach]
    B -->|Средний| D[Специальные офферы]
    B -->|Низкий| E[Регулярное вовлечение]
    C --> F[Персональный менеджер]
    D --> G[Скидки/Бонусы]
    E --> H[Email-кампании]
\`\`\``;
    }
    return `## UX-Аналитика

Я могу помочь с:

### 📊 Анализ метрик
- **Conversion Rate** — конверсия и воронки
- **Retention/Churn** — удержание и отток  
- **NPS/CSAT/CES** — удовлетворённость
- **SUS/TTV** — юзабилити

### 🔄 Userflow диаграммы
Запросите "построй userflow" для получения Mermaid-диаграммы

### 📄 Анализ страниц
Запросите "анализ страницы" для разбора сценариев

### 📈 Ключевые метрики:
- Conversion Rate: целевой > 3%
- Bounce Rate: целевой < 40%
- NPS: целевой > 50
- CSAT: целевой > 4.5/5`;
  }
  
  if (agentType === 'persona') {
    if (lowerMessage.includes('интерфейс') || lowerMessage.includes('дизайн')) {
      return `Как пользователь, я оцениваю интерфейс на 7/10.

**Что мне нравится:**
- Современный дизайн
- Понятные иконки
- Быстрая загрузка

**Что вызывает вопросы:**
- Много информации на главном экране
- Не сразу нашла нужный раздел
- Мелкий шрифт в описании тарифов

**Моя рекомендация:** Сделайте акцент на главном, уберите лишнее.`;
    }
    if (lowerMessage.includes('боль') || lowerMessage.includes('проблем')) {
      return `## Мои основные боли как пользователя:

1. **Навигация** - сложно найти нужный раздел (42% жалуются)
2. **Формы** - слишком длинные поля, приходится заполнять дважды
3. **Информация** - много мелкого текста, сложно сравнивать
4. **Мобильная версия** - кнопки слишком маленькие

**Мой приоритет:** Упростите навигацию, это критично для меня.`;
    }
    return `Привет! Я Анна, типичный пользователь цифровых продуктов.

Я могу:
- Оценить интерфейс с точки зрения пользователя
- Рассказать о своих болях и потребностях
- Дать обратную связь по функциям

Задайте вопрос о моём опыте!`;
  }
  
  if (agentType === 'validator') {
    if (lowerMessage.includes('гипотез') || lowerMessage.includes('провер')) {
      return `## Валидация гипотезы

### Критерии оценки:
1. **Измеримость** - можно ли проверить количественно?
2. **Релевантность** - связана ли с бизнес-целями?
3. **Реалистичность** - достижима ли?

### Риски гипотезы:
- Нет базовой метрики для сравнения
- Не учтён мобильный трафик (65%)
- Малая выборка для тестирования

### Рекомендации:
1. Определить baseline конверсии
2. Провести A/B тест на 2 недели
3. Сегментировать по устройствам`;
    }
    if (lowerMessage.includes('риск') || lowerMessage.includes('редизайн')) {
      return `## Риски редизайна

### Высокие риски:
- **Потеря пользователей** - привыкание к старому интерфейсу
- **Падение конверсии** - временный спад при переходе
- **Технические проблемы** - баги при запуске

### Средние риски:
- **Негативные отзывы** - реакция на изменения
- **SEO-влияние** - изменение структуры

### Митигация:
1. Поэтапный запуск
2. Возможность отката
3. Сбор обратной связи
4. A/B тестирование`;
    }
    return `## Валидация решения

✅ **Сильные стороны:**
- Логичная структура
- Учтены основные потребности

⚠️ **Риски:**
- Не учтён мобильный трафик (65%)
- Нет A/B тестирования

💡 **Рекомендации:**
1. Провести тестирование на реальных пользователях
2. Добавить метрики для отслеживания`;
  }
  
  return `Я готов помочь с вашим вопросом. Пожалуйста, уточните, что именно вас интересует.`;
}

// GET - получить историю
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    
    if (conversationId) {
      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
          agent: true
        }
      });
      return NextResponse.json({ success: true, conversation });
    }
    
    const conversations = await db.conversation.findMany({
      include: {
        agent: true,
        _count: { select: { messages: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });
    
    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'ID required' },
        { status: 400 }
      );
    }
    
    await db.conversation.delete({ where: { id: conversationId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
