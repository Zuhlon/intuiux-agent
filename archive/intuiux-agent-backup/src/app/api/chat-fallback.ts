// Fallback ответы при недоступности AI
function getFallbackResponse(agentType: string, message: string): string {
  
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

## 📊 Детальный анализ этапов

### Этап 1: Осознание
| Аспект | Описание |
|--------|----------|
| **Цель** | Понять потребность в продукте |
| **Touchpoints** | Поиск, Соцсети, Реклама |
| **Эмоция** | Интерес (score: 3/5) |
| **Боли** | Много вариантов, сложно выбрать |
| **Возможности** | SEO-оптимизация, контент-маркетинг |

### Этап 2: Рассмотрение
| Аспект | Описание |
|--------|----------|
| **Цель** | Изучить продукт и сравнить |
| **Touchpoints** | Сайт, Демо, Отзывы |
| **Эмоция** | Взволнованность (score: 4/5) |
| **Боли** | Недостаточно информации о ценах |
| **Возможности** | Калькулятор стоимости, кейсы |

### Этап 3: Принятие решения
| Аспект | Описание |
|--------|----------|
| **Цель** | Совершить покупку |
| **Touchpoints** | Форма заказа, Оплата |
| **Эмоция** | Волнение (score: 2/5) |
| **Боли** | Долгий процесс оформления |
| **Возможности** | Упрощение checkout, guest checkout |

### Этап 4: Использование
| Аспект | Описание |
|--------|----------|
| **Цель** | Получить ценность от продукта |
| **Touchpoints** | Интерфейс, Поддержка |
| **Эмоция** | Удовлетворение (score: 5/5) |
| **Боли** | Кривая обучения |
| **Возможности** | Интерактивный онбординг |

### Этап 5: Лояльность
| Аспект | Описание |
|--------|----------|
| **Цель** | Стать постоянным клиентом |
| **Touchpoints** | Email, Сообщество |
| **Эмоция** | Радость (score: 5/5) |
| **Боли** | Нет ощущения сообщества |
| **Возможности** | Программа лояльности, рефералы |

---

## 🎯 Ключевые инсайты

1. **Критический этап:** Принятие решения (низкий эмоциональный score)
2. **Главная боль:** Сложность оформления заказа
3. **Главная возможность:** Упрощение процесса покупки`;
  }

  // === АРХИТЕКТОР IA (отдельно от CJM!) ===
  if (agentType === 'ia_architect') {
    // Check if message contains IA-specific keywords
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('таксономи') || lowerMessage.includes('сущност') || lowerMessage.includes('архитектур')) {
      return `## 🏗️ Информационная архитектура с таксономиями

### Структура продукта

\`\`\`mermaid
mindmap
  root((Продукт))
    Главная
      Дашборд
      Быстрые действия
      Виджеты
    Каталог
      Категории
      Товары
      Фильтры
      Поиск
    Личный кабинет
      Профиль
      Заказы
      Избранное
      Настройки
    Поддержка
      FAQ
      Чат
      Документация
\`\`\`

---

## 📋 Таксономия сущностей

### 1. Пользовательские сущности (User Entities)

\`\`\`mermaid
erDiagram
    USER ||--o{ ORDER : creates
    USER ||--o{ REVIEW : writes
    USER ||--o{ FAVORITE : has
    USER {
        string id PK
        string email
        string name
        string phone
        datetime created_at
        datetime updated_at
    }
\`\`\`

| Сущность | Атрибуты | Тип | Описание |
|----------|----------|-----|----------|
| **User** | id | UUID | Уникальный идентификатор |
| | email | String | Email пользователя |
| | name | String | Имя |
| | phone | String | Телефон |
| | avatar | String | URL аватара |
| | role | Enum | Роль (user, admin) |

### 2. Контентные сущности (Content Entities)

\`\`\`mermaid
erDiagram
    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ VARIANT : has
    PRODUCT {
        string id PK
        string name
        string description
        float price
        string category_id FK
    }
    CATEGORY {
        string id PK
        string name
        string slug
        string parent_id FK
    }
\`\`\`

| Сущность | Атрибуты | Тип | Описание |
|----------|----------|-----|----------|
| **Product** | id | UUID | Уникальный идентификатор |
| | name | String | Название |
| | description | Text | Описание |
| | price | Decimal | Цена |
| | category_id | UUID | ID категории |
| | status | Enum | Статус (active, draft) |

### 3. Системные сущности (System Entities)

\`\`\`mermaid
erDiagram
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER }o--|| USER : belongs_to
    ORDER {
        string id PK
        string user_id FK
        string status
        float total
        datetime created_at
    }
    ORDER_ITEM {
        string id PK
        string order_id FK
        string product_id FK
        int quantity
        float price
    }
\`\`\`

| Сущность | Атрибуты | Тип | Описание |
|----------|----------|-----|----------|
| **Order** | id | UUID | Уникальный идентификатор |
| | user_id | UUID | ID пользователя |
| | status | Enum | Статус заказа |
| | total | Decimal | Сумма заказа |
| | payment_status | Enum | Статус оплаты |

---

## 🔗 ER-диаграмма связей

\`\`\`mermaid
erDiagram
    USER ||--o{ ORDER : "создаёт"
    USER ||--o{ REVIEW : "пишет"
    USER ||--o{ FAVORITE : "добавляет"
    ORDER ||--|{ ORDER_ITEM : "содержит"
    PRODUCT ||--o{ ORDER_ITEM : "в заказах"
    PRODUCT ||--o{ REVIEW : "получает"
    PRODUCT }o--|| CATEGORY : "принадлежит"
    PRODUCT ||--o{ FAVORITE : "в избранном"
    CATEGORY ||--o{ CATEGORY : "подкатегории"
\`\`\`

---

## 🧭 Навигационная структура

| Уровень | Раздел | URL | Описание |
|---------|--------|-----|----------|
| 1 | Главная | / | Дашборд |
| 1 | Каталог | /catalog | Список товаров |
| 2 | Категория | /catalog/[slug] | Товары категории |
| 2 | Товар | /product/[id] | Карточка товара |
| 1 | Корзина | /cart | Оформление заказа |
| 1 | Кабинет | /profile | Личный кабинет |`;
    }
    
    // Default: Userflow
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

### Описание экранов

| Экран | Цель | Ключевые элементы | Действия |
|-------|------|-------------------|----------|
| Дашборд | Обзор активности | Карточки, Графики, Быстрые действия | Создать, Найти, Настроить |
| Создание | Добавить данные | Форма, Валидация, Подсказки | Заполнить, Сохранить, Отмена |
| Поиск | Найти информацию | Строка поиска, Фильтры, Результаты | Ввести, Фильтровать, Выбрать |
| Настройки | Персонализация | Группы настроек, Переключатели | Изменить, Сохранить |`;
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
    <title>Прототип — Техно Стиль</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Яндекс.Метрика -->
    <script type="text/javascript">
       (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
       m[i].l=1*new Date();
       for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
       k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
       (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
       ym(METRIKA_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
    </script>
</head>
<body class="min-h-screen bg-[#0a0a0f] text-white">
    <!-- Skip Link -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-500 text-black px-4 py-2 rounded">
        Перейти к контенту
    </a>

    <!-- Header -->
    <header role="banner" class="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10">
        <nav role="navigation" aria-label="Главная навигация" class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span class="text-black font-bold">⚡</span>
                </div>
                <span class="font-semibold text-lg">Product</span>
            </div>
            <div class="hidden md:flex items-center gap-6">
                <a href="#features" data-ym-event="navigation" data-ym-category="menu" data-ym-label="features" 
                   class="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-2 py-1">Функции</a>
                <a href="#pricing" data-ym-event="navigation" data-ym-category="menu" data-ym-label="pricing"
                   class="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-2 py-1">Цены</a>
                <a href="#contact" data-ym-event="navigation" data-ym-category="menu" data-ym-label="contact"
                   class="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-2 py-1">Контакты</a>
            </div>
            <button data-ym-event="click" data-ym-category="CTA" data-ym-label="header_cta" data-ym-goal="registration"
                    class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-gray-900">
                Начать
            </button>
        </nav>
    </header>

    <!-- Main Content -->
    <main id="main-content" role="main" class="pt-24">
        <!-- Hero Section -->
        <section aria-labelledby="hero-heading" class="max-w-7xl mx-auto px-4 py-20 text-center">
            <div class="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm mb-6">
                ✨ Новая версия 2.0
            </div>
            <h1 id="hero-heading" class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Упростите свой<br/>рабочий процесс
            </h1>
            <p class="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                Современный инструмент для команд, которые ценят простоту и эффективность
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button data-ym-event="click" data-ym-category="CTA" data-ym-label="main_cta" data-ym-goal="registration"
                        class="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400">
                    Попробовать бесплатно
                </button>
                <button data-ym-event="click" data-ym-category="CTA" data-ym-label="demo"
                        class="px-8 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
                    ▶ Посмотреть демо
                </button>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" aria-labelledby="features-heading" class="max-w-7xl mx-auto px-4 py-16">
            <h2 id="features-heading" class="sr-only">Возможности</h2>
            <div class="grid md:grid-cols-3 gap-6">
                <article data-ym-category="features" data-ym-label="feature_speed" class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                        <span class="text-2xl">⚡</span>
                    </div>
                    <h3 class="font-semibold text-lg mb-2">Быстрый старт</h3>
                    <p class="text-gray-400">Начните работу за 5 минут без сложной настройки</p>
                </article>
                <article data-ym-category="features" data-ym-label="feature_security" class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                        <span class="text-2xl">🔒</span>
                    </div>
                    <h3 class="font-semibold text-lg mb-2">Безопасность</h3>
                    <p class="text-gray-400">Шифрование данных и соответствие стандартам</p>
                </article>
                <article data-ym-category="features" data-ym-label="feature_integrations" class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                        <span class="text-2xl">🔄</span>
                    </div>
                    <h3 class="font-semibold text-lg mb-2">Интеграции</h3>
                    <p class="text-gray-400">Подключение к вашим любимым инструментам</p>
                </article>
            </div>
        </section>

        <!-- Lead Form Section -->
        <section id="contact" aria-labelledby="contact-heading" class="max-w-2xl mx-auto px-4 py-16">
            <div class="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 id="contact-heading" class="text-2xl font-bold mb-6 text-center">Оставьте заявку</h2>
                <form data-ym-event="form_submit" data-ym-category="lead" data-ym-goal="contact_form" class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm text-gray-400 mb-2">Имя</label>
                        <input type="text" id="name" name="name" required
                               class="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-lg focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                               data-ym-category="form" data-ym-label="name_input">
                    </div>
                    <div>
                        <label for="email" class="block text-sm text-gray-400 mb-2">Email</label>
                        <input type="email" id="email" name="email" required
                               class="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-lg focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                               data-ym-category="form" data-ym-label="email_input">
                    </div>
                    <button type="submit" data-ym-event="click" data-ym-category="CTA" data-ym-label="form_submit" data-ym-goal="lead_generation"
                            class="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        Отправить
                    </button>
                </form>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer role="contentinfo" class="border-t border-white/10 mt-20">
        <div class="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">
            <p>© 2025 Product. Все права защищены.</p>
        </div>
    </footer>
</body>
</html>
\`\`\`

### Разметка для Яндекс.Метрики:
- \`data-ym-event\` — тип события (click, navigation, form_submit)
- \`data-ym-category\` — категория элемента
- \`data-ym-label\` — метка для идентификации
- \`data-ym-goal\` — цель конверсии

### Accessibility:
- Skip-link для навигации с клавиатуры
- ARIA roles и labels
- Фокус-индикаторы
- Контрастность WCAG AA`;
  }

  // === АРХИТЕКТОР ЗАДАНИЙ (Тестирование) ===
  if (agentType === 'task_architect') {
    return `## 📋 Комплект для юзабилити-тестирования

---

## 1. 📧 Скрипт приглашения участников

### Email-рассылка

**Тема:** Приглашение на тестирование нового продукта

---

Уважаемый(ая) [Имя]!

Мы разрабатываем [Название продукта] — [Краткое описание]. 

Нам важно ваше мнение! Приглашаем вас принять участие в юзабилити-тестировании.

**Что мы тестируем:** Новый интерфейс [описание функции]
**Формат:** Онлайн-созвон (Zoom) + демонстрация экрана
**Длительность:** 30-45 минут
**Вознаграждение:** [Сумма] рублей / [Подарок] / [Промокод]

**Профиль участника:**
- Возраст: 25-45 лет
- Опыт работы с [тип продуктов]: от 6 месяцев
- Активность: еженедельное использование

**Что нужно делать:**
1. Выполнить несколько задач в интерфейсе
2. Комментировать свои действия вслух
3. Ответить на вопросы о впечатлениях

**Выберите удобное время:**
[Ссылка на календарь]

**Контакты:**
Email: [email]
Telegram: [@username]

Будем рады вашему участию!

---

### Сообщение для мессенджеров (Telegram/WhatsApp)

🧪 **Приглашение на тестирование!**

Мы создаём [Продукт] и ищем людей для теста интерфейса.

👤 **Кого ищем:** [описание профиля]
⏱️ **Время:** 30-45 мин онлайн
🎁 **Благодарность:** [вознаграждение]

Интересно? Записывайся: [ссылка]

---

### Пост для соцсетей

🚀 **Помогите нам сделать продукт лучше!**

Ищем участников для юзабилити-тестирования [Название].

✅ Тестируем: [описание]
✅ Формат: онлайн
✅ Время: 30-45 минут
✅ Благодарность: [вознаграждение]

Подходит вам? Пишите в личку или комментируйте! 👇

---

## 2. 📖 Гайдлайн проведения тестирования

### Подготовка к тесту

#### Оборудование
- [ ] Компьютер с веб-камерой
- [ ] Стабильный интернет
- [ ] Zoom / Google Meet / Discord
- [ ] Запись экрана + камеры + аудио
- [ ] Прототип на отдельном устройстве или в другом окне

#### Помещение (если очно)
- [ ] Тихое помещение без отвлекающих факторов
- [ ] Удобное кресло для участника
- [ ] Вода/чай для участника

#### Материалы
- [ ] Распечатанный скрипт модератора
- [ ] Протокол наблюдателя (пустой)
- [ ] Список задач для участника
- [ ] Post-its для заметок

---

### Структура сессии (Тайминг)

| Этап | Время | Действие |
|------|-------|----------|
| **Приветствие** | 2 мин | Знакомство, настройка записи |
| **Введение** | 3 мин | Объяснение формата, правила |
| **Предтестовое интервью** | 5 мин | Вопросы о бэкграунде |
| **Выполнение задач** | 20 мин | Основное тестирование |
| **Пост-тест интервью** | 10 мин | Вопросы о впечатлениях |
| **Завершение** | 5 мин | Благодарность, вознаграждение |
| **Итого** | 45 мин | |

---

### Скрипт модератора

#### Приветствие (2 мин)

> Здравствуйте! Меня зовут [Имя], я исследователь [Название компании]. Спасибо, что согласились участвовать!
>
> Сегодня мы тестируем наш новый продукт, а не вас. Если что-то не получится — это наша вина, а не ваша. Чувствуйте себя свободно!
>
> Мы будем записывать сессию, чтобы позже проанализировать. Запись видите только наша команда. Вы согласны?

#### Введение (3 мин)

> Формат следующий: я дам вам несколько задач, а вы будете выполнять их в интерфейсе. 
>
> Самое важное — **думайте вслух**! Рассказывайте, что вы видите, что думаете, что хотите сделать. Даже если это звучит глупо — говорите всё.
>
> Есть вопросы? Отлично, давайте начнём!

#### Предтестовое интервью (5 мин)

1. Чем вы занимаетесь по работе?
2. Какими подобными продуктами пользуетесь?
3. Как часто и для чего используете [тип продукта]?
4. Что вам нравится в текущих инструментах?
5. Что не нравится?

---

### Задачи для тестирования

#### Задача 1: Основной сценарий (5 мин)

> Представьте, что вы впервые зашли на сайт. Ваша задача — [описание задачи].
>
> Начинайте, когда будете готовы.

**Критерии успеха:**
- [ ] Задача выполнена полностью
- [ ] Время: менее X минут
- [ ] Без помощи модератора

**Наблюдения:**
- Путь пользователя
- Затруднения
- Комментарии

#### Задача 2: Поиск информации (3 мин)

> Теперь найдите информацию о [описание].

**Критерии успеха:**
- [ ] Найдено за ≤ 3 клика
- [ ] Без использования поиска

#### Задача 3: Настройки (3 мин)

> Измените настройки [описание].

---

### Пост-тест интервью (10 мин)

1. **Общее впечатление:**
   > Какое первое впечатление от интерфейса?

2. **Простота использования:**
   > Что было самым простым? Что самым сложным?

3. **Понятность:**
   > Было ли что-то непонятное или неожиданное?

4. **Предпочтения:**
   > Что вам понравилось больше всего?

5. **Улучшения:**
   > Что бы вы изменили?

6. **Сравнение:**
   > Как этот интерфейс по сравнению с [конкурент]?

7. **Оценка (SUS):**
   > Оцените сложность использования от 1 (очень сложно) до 5 (очень легко)

---

### Чек-лист наблюдателя

| Критерий | Оценка (1-5) | Заметки |
|----------|--------------|---------|
| Понятность навигации | | |
| Визуальная ясность | | |
| Скорость выполнения | | |
| Количество ошибок | | |
| Удовлетворённость | | |
| Общее впечатление | | |

**Заметки о проблемах:**
| Время | Проблема | Severity | Рекомендация |
|-------|----------|----------|--------------|
| | | | |

---

## 3. 📊 Критерии оценки

### Количественные метрики

| Метрика | Цель | Измерение |
|---------|------|-----------|
| Task Success Rate | > 85% | % выполненных задач |
| Time on Task | < X мин | Среднее время на задачу |
| Error Rate | < 5% | % ошибочных действий |
| Clicks to Complete | Минимум | Количество кликов |

### Качественные метрики

| Метрика | Цель | Измерение |
|---------|------|-----------|
| SUS Score | > 68 | System Usability Scale |
| NPS | > 50 | Net Promoter Score |
| CES | < 3 | Customer Effort Score |
| Sentiment | Позитивный | Анализ комментариев |

### Severity Rating

| Уровень | Описание | Пример |
|---------|----------|--------|
| **Critical (4)** | Блокирует задачу | Невозможно完成任务 |
| **Major (3)** | Серьёзные затруднения | Пользователи теряются |
| **Minor (2)** | Небольшие проблемы | Требуется время на понимание |
| **Cosmetic (1)** | Косметические недочёты | Опечатки, цвета |

---

## 4. 📝 Шаблон отчёта

### Резюме
- Количество участников: X
- Общий SUS Score: X
- Главная проблема: [описание]
- Главная рекомендация: [описание]

### Найденные проблемы

| # | Проблема | Severity | Частота | Рекомендация |
|---|----------|----------|---------|--------------|
| 1 | | | | |
| 2 | | | | |

### Цитаты участников

> "Цитата 1"
> "Цитата 2"

### Приоритизация исправлений

1. **P0 (Critical):** [описание] — исправить немедленно
2. **P1 (High):** [описание] — исправить в следующем спринте
3. **P2 (Medium):** [описание] — запланировать на ближайшие месяцы

---

## 5. ✅ Чек-лист проведения

### До теста
- [ ] Прототип готов и работает
- [ ] Ссылка протестирована
- [ ] Запись настроена
- [ ] Скрипт распечатан
- [ ] Вознаграждение подготовлено

### Во время теста
- [ ] Запись включена
- [ ] Участник говорит вслух
- [ ] Не подсказываю участнику
- [ ] Заметки ведутся

### После теста
- [ ] Запись сохранена
- [ ] Заметки структурированы
- [ ] Благодарность отправлена
- [ ] Вознаграждение выплачено`;
  }

  // Default fallback
  return `Я получил ваш запрос. К сожалению, возникла задержка с обработкой. 

Пожалуйста, попробуйте ещё раз или обратитесь к администратору, если проблема повторяется.`;
}
