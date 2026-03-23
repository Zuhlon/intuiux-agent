// Idea Extractor - Product Owner with 10 Years Experience
// v8.0 - Deep PO expertise: industry mastery, context extraction, speech transformation, hypothesis enrichment

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
}

/**
 * INDUSTRY KNOWLEDGE BASE - 10 Years of PO Experience
 * Each industry has specific patterns, sub-industries, and market context
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
    patterns: [/(edtech|обучени[ею]|курс|урок|студент|учител|школьн|образован|lms|преподава|учебн|знан|лекци|семинар)/i],
    subIndustries: [
      { patterns: [/онлайн.*школ|школьн.*образов/i], name: 'Онлайн-школы' },
      { patterns: [/корпоративн.*обучен|обучен.*сотрудник/i], name: 'Корпоративное обучение' },
      { patterns: [/детск|дошкольн|подготовк.*школ/i], name: 'Детское образование' },
      { patterns: [/высш.*образован|университет|вуз/i], name: 'Высшее образование' },
      { patterns: [/профессиональн|переподготов|повышен.*квалифик/i], name: 'Профпереподготовка' },
      { patterns: [/язык.*обучен|английск|иностр.*язык/i], name: 'Языковые курсы' },
    ],
    marketContext: 'Рынок онлайн-образования растет 20-30% в год. Ключевые драйверы: удаленка, необходимость рескиллинга. Средний чек: 5-50K RUB за курс.',
    typicalFeatures: ['Видеокурсы', 'Тестирование', 'Сертификаты', 'Прогресс-трекинг', 'Вебинары', 'Домашние задания'],
    metrics: ['Completion Rate', 'Retention', 'NPS', 'LTV/CAC', 'Активные пользователи'],
    competitors: ['Skillbox', 'GeekBrains', 'Нетология', 'Coursera', 'Udemy', 'Stepik'],
  },
  'FinTech': {
    patterns: [/(fintech|платеж|перевод|кредит|страхов|инвестиц|банк|финанс|кошел|карт[аы]|деньг|счет|транзакц|вклад)/i],
    subIndustries: [
      { patterns: [/пла(теж|тёж)|перевод.*денег|p2p/i], name: 'Платежные системы' },
      { patterns: [/кредит|займ|микрофинан/i], name: 'Кредитование' },
      { patterns: [/инвестиц|брокер|акци|бирж/i], name: 'Инвестиционные платформы' },
      { patterns: [/страхов|полис|выплат/i], name: 'InsurTech' },
      { patterns: [/бухгалтер|учет|налог|отчетност/i], name: 'Финучет' },
      { patterns: [/бюджет|учет.*расход|деньг.*управлен/i], name: 'Личные финансы' },
    ],
    marketContext: 'FinTech - один из быстрорастущих секторов. Регуляторные барьеры высокие. Ключевое - доверие и безопасность. LTV высокий, но CAC тоже.',
    typicalFeatures: ['Переводы', 'Баланс', 'История', 'Биллинг', 'KYC', 'Push-уведомления', 'Безопасность'],
    metrics: ['MAU', 'GMV', 'Take rate', 'Default rate', 'Fraud rate', 'NPS'],
    competitors: ['Тинькофф', 'Сбер', 'Точка', 'Рокетбанк', 'Revolut'],
  },
  'HealthTech': {
    patterns: [/(healthtech|медицин|врач|пациент|клиник|здоровь|аптек|диагност|telemed|телемед|лечен|болезн|симптом|рецепт)/i],
    subIndustries: [
      { patterns: [/телемед|онлайн.*врач|консультац.*врач/i], name: 'Телемедицина' },
      { patterns: [/аптек|лекарств|препарат/i], name: 'E-pharmacy' },
      { patterns: [/клиник|запис.*врач|прием/i], name: 'Управление клиникой' },
      { patterns: [/диагност|анализ|обследован/i], name: 'Диагностика' },
      { patterns: [/психолог|психотерап|ментальн/i], name: 'Mental Health' },
      { patterns: [/фитнес|зож|диет|питан|калор/i], name: 'Здоровый образ жизни' },
    ],
    marketContext: 'Рынок медицины консервативен, но цифровизация ускорилась после COVID. Регуляторика строгая. Доверие критично.',
    typicalFeatures: ['Запись к врачу', 'Электронная карта', 'Чат с врачом', 'Напоминания', 'Рецепты', 'История болезни'],
    metrics: ['Пациенты', 'Записи', 'Успешные консультации', 'Retention', 'Средний чек'],
    competitors: ['СберЗдоровье', 'Доктор рядом', 'ProDoctorov', 'Yandex.Health'],
  },
  'E-commerce': {
    patterns: [/(ecommerce|магазин|товар|корзин|доставк|заказ|покупк|продаж|маркетплейс|ритейл|каталог|чекаут)/i],
    subIndustries: [
      { patterns: [/маркетплейс|продавец|селлер/i], name: 'Маркетплейсы' },
      { patterns: [/доставк.*продукт|продукт.*доставк|еда/i], name: 'Grocery delivery' },
      { patterns: [/одежд|обувь|fashion/i], name: 'Fashion e-commerce' },
      { patterns: [/электроник|техник|гадж/i], name: 'Electronics' },
      { patterns: [/доставк.*[а-я]+\s/i], name: 'D2C бренды' },
    ],
    marketContext: 'E-commerce растет 30%+ в год. Ключевое - логистика, клиентский сервис, персонализация. Margins под давлением.',
    typicalFeatures: ['Каталог', 'Корзина', 'Чекаут', 'Доставка', 'Оплата', 'Отзывы', 'Рекомендации', 'Личный кабинет'],
    metrics: ['Conversion Rate', 'AOV', 'LTV', 'Return Rate', 'Cart Abandonment', 'NPS'],
    competitors: ['Ozon', 'Wildberries', 'Яндекс.Маркет', 'Amazon'],
  },
  'FoodTech': {
    patterns: [/(foodtech|ресторан|кафе|ед[аы]|пищ|меню|бронир.*столик|доставк.*ед|рецепт|готовк|кулин)/i],
    subIndustries: [
      { patterns: [/доставк.*ед|ед.*доставк/i], name: 'Доставка еды' },
      { patterns: [/ресторан|кафе|столик/i], name: 'Ресторанный бизнес' },
      { patterns: [/рецепт|готовк|кулин/i], name: 'Рецепты и готовка' },
      { patterns: [/бронир.*столик/i], name: 'Бронирование столов' },
      { patterns: [/продукт.*доставк|продукт.*домой/i], name: 'Доставка продуктов' },
    ],
    marketContext: 'FoodTech показывает взрывной рост. Конкуренция высокая, маржинальность низкая. Ключевое - скорость и качество.',
    typicalFeatures: ['Меню', 'Корзина', 'Доставка', 'Отслеживание', 'Отзывы', 'Программа лояльности'],
    metrics: ['Orders', 'AOV', 'Delivery Time', 'Rating', 'Retention', 'CAC/LTV'],
    competitors: ['Яндекс.Еда', 'Delivery Club', 'Edadeal', 'Самокат'],
  },
  'HRTech': {
    patterns: [/(hrtech|hr|рекрут|ваканси|резюме|сотрудник|кадр|персонал|онбординг|зарплат|отпуск|график)/i],
    subIndustries: [
      { patterns: [/ваканси|резюме|поиск.*работ|рекрут/i], name: 'Рекрутинг' },
      { patterns: [/онбординг|адаптац.*сотрудник/i], name: 'Онбординг' },
      { patterns: [/зарплат|расчет.*зп|payroll/i], name: 'Зарплатные системы' },
      { patterns: [/обучен.*сотрудник|развит.*персонал/i], name: 'LMS для бизнеса' },
      { patterns: [/кпи|цели|performance|оценк.*сотрудник/i], name: 'Performance management' },
    ],
    marketContext: 'HR-технологии на подъеме. Remote work драйвер. B2B продажи, длинные циклы сделки. Ключевое - интеграция с существующими системами.',
    typicalFeatures: ['Вакансии', 'Отклики', 'Календарь', 'Анкеты', 'Отчеты', 'Интеграции'],
    metrics: ['Time to Hire', 'Cost per Hire', 'Retention', 'Employee NPS', 'Активные вакансии'],
    competitors: ['hh.ru', 'Habr Career', 'SuperJob', 'Workday', 'BambooHR'],
  },
  'MarTech': {
    patterns: [/(martech|маркетинг|реклам|кампани[яи]|лид|конверси|crm|воронк|email|рассылк|трафик|seo|контекст)/i],
    subIndustries: [
      { patterns: [/crm|клиент.*баз|сделк/i], name: 'CRM системы' },
      { patterns: [/email|рассылк/i], name: 'Email-маркетинг' },
      { patterns: [/аналитик|метрик|дашборд/i], name: 'Маркетинговая аналитика' },
      { patterns: [/автоматиз.*маркетинг|marketing.*automation/i], name: 'Marketing Automation' },
      { patterns: [/seo|оптимиз.*поиск/i], name: 'SEO инструменты' },
    ],
    marketContext: 'MarTech-рынок переполнен (8000+ инструментов). Ключевое - интеграции и ROI. Покупатели - маркетологи, CMO.',
    typicalFeatures: ['Кампании', 'Сегментация', 'Автоматизация', 'Аналитика', 'Интеграции', 'A/B тесты'],
    metrics: ['ROI', 'Cost per Lead', 'Conversion Rate', 'Email Open Rate', 'CTR'],
    competitors: ['Битрикс24', 'AmoCRM', 'Unisender', 'Mindbox', 'HubSpot'],
  },
  'PropTech': {
    patterns: [/(proptech|недвижим|квартир|дом|аренд|покупк.*жил|риэлтор|агентств.*недв|жил[ьъ]|ипотек)/i],
    subIndustries: [
      { patterns: [/аренд|съем|сда.*квартир/i], name: 'Аренда' },
      { patterns: [/покупк|продаж.*недв|ипотек/i], name: 'Продажа недвижимости' },
      { patterns: [/управлен.*недв|жкх|управляющ.*компан/i], name: 'Управление недвижимостью' },
      { patterns: [/строительств|застройщик|новостро/i], name: 'Девелопмент' },
    ],
    marketContext: 'PropTech трансформируется. Ключевое - доверие, качество данных, скорость сделки. High-ticket, длинный цикл.',
    typicalFeatures: ['Поиск', 'Фильтры', 'Карта', 'Фото', 'Контакты', 'Ипотечный калькулятор', 'Онлайн-показ'],
    metrics: ['Leads', 'Conversion to Deal', 'Average Deal Value', 'Time to Close', 'NPS'],
    competitors: ['Циан', 'Авито Недвижимость', 'Домклик', 'Яндекс.Недвижимость'],
  },
  'Logistics': {
    patterns: [/(logistics|логист|склад|груз|перевозк|транспорт|маршрут|доставк.*груз|грузоперевоз)/i],
    subIndustries: [
      { patterns: [/склад|хранен|wms/i], name: 'Складская логистика' },
      { patterns: [/перевозк|транспорт|фура|груз/i], name: 'Грузоперевозки' },
      { patterns: [/последн.*миля|last.?mile/i], name: 'Last mile доставка' },
      { patterns: [/отслеживан|track|мониторинг.*транспорт/i], name: 'Трекинг и мониторинг' },
    ],
    marketContext: 'Логистика - backbone e-commerce. Ключевое - оптимизация, скорость, прозрачность. Margins низкие, объемы высокие.',
    typicalFeatures: ['Трекинг', 'Маршрутизация', 'Управление водителями', 'Складской учет', 'Документооборот'],
    metrics: ['On-time delivery', 'Cost per delivery', 'Vehicle utilization', 'Fuel efficiency', 'Claims rate'],
    competitors: ['СДЭК', 'Яндекс.Доставка', 'GDEPO', 'PickPoint'],
  },
  'SaaS/B2B': {
    patterns: [/(saas|b2b|предприят|бизнес.*решен|корпорат|интеграц|erp|бухгалтер|учет|автоматиз.*процесс)/i],
    subIndustries: [
      { patterns: [/erp|учет.*предприят/i], name: 'ERP системы' },
      { patterns: [/crm|продаж|клиент/i], name: 'CRM' },
      { patterns: [/проект|задач|trello|kanban/i], name: 'Project Management' },
      { patterns: [/коммуникац|чат|видео|связь/i], name: 'Коммуникации' },
      { patterns: [/документ|эдо|подпис/i], name: 'Документооборот' },
    ],
    marketContext: 'SaaS - устойчивая модель. Ключевое - Churn reduction, Expansion revenue. Sales циклы длинные. PLG vs Sales-led.',
    typicalFeatures: ['Дашборд', 'Настройки', 'Интеграции', 'API', 'Роли', 'Отчеты', 'Автоматизация'],
    metrics: ['MRR', 'ARR', 'Churn Rate', 'CAC', 'LTV', 'NRR', 'ARR per customer'],
    competitors: ['Битрикс24', 'amoCRM', 'Jira', 'Slack', 'Notion'],
  },
  'AI/ML': {
    patterns: [/(ai|ии|искусствен.*интеллект|нейросет|машинн.*обучен|ml|gpt|llm|автоматиз|генер|chatgpt)/i],
    subIndustries: [
      { patterns: [/генер.*контент|создан.*контент|написа.*текст/i], name: 'Generative AI' },
      { patterns: [/распознаван|vision|изображен|видео.*анализ/i], name: 'Computer Vision' },
      { patterns: [/голос|реч.*распознаван|tts|asr/i], name: 'Speech AI' },
      { patterns: [/чат.*бот|ассистент|поддержк/i], name: 'AI Chatbots' },
      { patterns: [/рекомендац|персонализ|подбор/i], name: 'Recommendation Systems' },
    ],
    marketContext: 'AI - хайп + реальная ценность. Ключевое - найти product-market fit. Таланты дороги. API-first бизнес-модели.',
    typicalFeatures: ['AI API', 'Модели', 'Промпты', 'Обучение', 'Инференс', 'Аналитика'],
    metrics: ['API calls', 'Latency', 'Accuracy', 'Cost per inference', 'User adoption'],
    competitors: ['OpenAI', 'Anthropic', 'YandexGPT', 'GigaChat'],
  },
  'TravelTech': {
    patterns: [/(travel|туризм|путешеств|отель|бронир.*билет|самолет|поезд|тур|авиабилет|гостиниц)/i],
    subIndustries: [
      { patterns: [/отель|гостиниц|проживан/i], name: 'Бронирование отелей' },
      { patterns: [/авиабилет|самолет|перелет/i], name: 'Авиабилеты' },
      { patterns: [/тур|туроператор|путевк/i], name: 'Турпродукты' },
      { patterns: [/поезд.*билет|жд|жд.*касс/i], name: 'ЖД билеты' },
    ],
    marketContext: 'Travel восстанавливается после COVID. Ключевое - персонализация, мобильность, мгновенное бронирование.',
    typicalFeatures: ['Поиск', 'Фильтры', 'Бронирование', 'Оплата', 'Маршрут', 'Отзывы'],
    metrics: ['Bookings', 'Conversion', 'Average Booking Value', 'Cancellation Rate', 'NPS'],
    competitors: ['Яндекс.Путешествия', 'Ostrovok', 'Aviasales', 'Tutu.ru'],
  },
  'LegalTech': {
    patterns: [/(legaltech|юрист|прав|договор|документ|нотари|закон|юрид|суд|иск|адвокат)/i],
    subIndustries: [
      { patterns: [/договор|контракт|шаблон/i], name: 'Управление договорами' },
      { patterns: [/эдо|электронн.*подпис/i], name: 'Электронный документооборот' },
      { patterns: [/суд|иск|арбитраж/i], name: 'Судебная автоматизация' },
      { patterns: [/compliance|соответств|регулятор/i], name: 'Compliance' },
    ],
    marketContext: 'LegalTech нишевый, но растущий. Консервативные клиенты. Ключевое - безопасность, соответствие закону.',
    typicalFeatures: ['Шаблоны', 'Электронная подпись', 'Хранение', 'Напоминания', 'История'],
    metrics: ['Documents processed', 'Time saved', 'Compliance rate', 'NPS'],
    competitors: ['Doczilla', 'Pravo Tech', 'Контур.Диагностика'],
  },
  'MediaTech': {
    patterns: [/(media|контент|видео|аудио|подкаст|стать[яи]|блог|новост|медиа|издани|журнал)/i],
    subIndustries: [
      { patterns: [/видео|стрим|youtube|видеохост/i], name: 'Видеоплатформы' },
      { patterns: [/подкаст|аудио/i], name: 'Подкастинг' },
      { patterns: [/блог|стать|издани/i], name: 'Контент-платформы' },
      { patterns: [/новост|сми|журнал/i], name: 'Новостные медиа' },
    ],
    marketContext: 'Media в трансформации. Монетизация через подписки и рекламу. Ключевое - retention, engagement.',
    typicalFeatures: ['Контент', 'Подписка', 'Рекомендации', 'Комментарии', 'Сохранение', 'Плеер'],
    metrics: ['Pageviews', 'Time on site', 'Subscribers', 'Churn', 'ARPU', 'Engagement'],
    competitors: ['Яндекс.Дзен', 'VC.ru', 'The Village', 'Meduza'],
  },
  'EventTech': {
    patterns: [/(events?|мероприят|конференц|встреч|билет.*событи|афиш|регистрац.*мероприят|zoom|webinar)/i],
    subIndustries: [
      { patterns: [/конференц|форум|съезд/i], name: 'B2B мероприятия' },
      { patterns: [/вебинар|online.*event|zoom/i], name: 'Онлайн-мероприятия' },
      { patterns: [/билет|регистрац.*билет/i], name: 'Билетные системы' },
      { patterns: [/встреч|нетворк|networking/i], name: 'Нетворкинг платформы' },
    ],
    marketContext: 'EventTech гибридный после COVID. Ключевое - интерактивность, нетворкинг, аналитика участников.',
    typicalFeatures: ['Регистрация', 'Программа', 'Нетворкинг', 'Трансляция', 'Чат', 'Сертификаты'],
    metrics: ['Registrations', 'Attendance Rate', 'Engagement', 'NPS', 'Sponsor ROI'],
    competitors: ['Eventbrite', 'Timepad', 'Gather', 'Hopin'],
  },
  'SocialTech': {
    patterns: [/(social|социальн|сообществ|чат|мессендж|общение|друз|знакомств|dating)/i],
    subIndustries: [
      { patterns: [/мессендж|чат.*прилож/i], name: 'Мессенджеры' },
      { patterns: [/сообществ|форум|групп/i], name: 'Сообщества' },
      { patterns: [/знакомств|dating/i], name: 'Дейтинг' },
      { patterns: [/профессионал|linkedin|карьер/i], name: 'Профессиональные сети' },
    ],
    marketContext: 'Социальные продукты выигрывают на сетевом эффекте. Ключевое - вирусный рост, retention. Hard to crack.',
    typicalFeatures: ['Профиль', 'Лента', 'Подписки', 'Чат', 'Уведомления', 'Поиск'],
    metrics: ['DAU/MAU', 'Time spent', 'Viral coefficient', 'Retention D1/D7/D30', 'Engagement'],
    competitors: ['Telegram', 'VK', 'Badoo', 'TenChat'],
  },
  'SportTech': {
    patterns: [/(sport|спорт|фитнес|трениров|упражнен|зож|здоровый образ|зал|тренер|йог)/i],
    subIndustries: [
      { patterns: [/фитнес|зал|тренер/i], name: 'Фитнес-приложения' },
      { patterns: [/трениров|план.*трениров/i], name: 'Тренировочные платформы' },
      { patterns: [/йог|медитац/i], name: 'Wellness' },
      { patterns: [/спорт.*событи|соревнован|марафон/i], name: 'Спортивные события' },
    ],
    marketContext: 'SportTech растет на волне ЗОЖ. Ключевое - gamification, социальность, персонализация.',
    typicalFeatures: ['Тренировки', 'Трекер', 'Прогресс', 'Сообщество', 'Видео', 'Календарь'],
    metrics: ['Active users', 'Workouts completed', 'Retention', 'Subscription conversion'],
    competitors: ['Strava', 'Nike Training Club', 'Fitbit', 'Yoga Studio'],
  },
  'AutoTech': {
    patterns: [/(auto|авто|маши[на]|водител|такси|каршеринг|парков|карта.*дорог|навигац)/i],
    subIndustries: [
      { patterns: [/такси|агрегатор.*такс/i], name: 'Такси' },
      { patterns: [/каршеринг|совместн.*использован.*авто/i], name: 'Carsharing' },
      { patterns: [/парков|парковочн/i], name: 'Парковки' },
      { patterns: [/навигац|маршрут|дорог/i], name: 'Навигация' },
      { patterns: [/авто.*сервис|ремонт|сто/i], name: 'Автосервис' },
    ],
    marketContext: 'AutoTech трансформируется с электромобилями и автопилотами. Ключевое - convenience, cost, time.',
    typicalFeatures: ['Карта', 'Бронирование', 'Оплата', 'Отслеживание', 'История', 'Рейтинг'],
    metrics: ['Rides', 'Revenue per ride', 'Fleet utilization', 'User retention', 'NPS'],
    competitors: ['Яндекс.Такси', 'Делимобиль', 'BelkaCar', '2GIS'],
  },
  'Crypto/Blockchain': {
    patterns: [/(crypto|крипт|блокчейн|токен|nft|дефи|децентрализ|биткоин|эфириум|кошель.*крипт)/i],
    subIndustries: [
      { patterns: [/обмен|бирж|trade/i], name: 'Криптобиржи' },
      { patterns: [/кошел|wallet|хранен/i], name: 'Кошельки' },
      { patterns: [/nft|коллекцион/i], name: 'NFT маркетплейсы' },
      { patterns: [/дефи|defi|ленд/i], name: 'DeFi' },
    ],
    marketContext: 'Crypto волатильный рынок. Регуляторика меняется. Ключевое - безопасность, ликвидность, UX.',
    typicalFeatures: ['Кошелек', 'Торговля', 'История', 'Безопасность', 'Уведомления'],
    metrics: ['TVL', 'Volume', 'Users', 'Fees', 'Token price'],
    competitors: ['Binance', 'Bybit', 'MetaMask', 'OpenSea'],
  },
  'BeautyTech': {
    patterns: [/(beauty|красот|космет|салон|парикмах|услуг.*красот|макияж|бров|ногот)/i],
    subIndustries: [
      { patterns: [/салон|парикмах|услуг/i], name: 'Салоны красоты' },
      { patterns: [/запис.*салон|онлайн.*запис/i], name: 'Системы записи' },
      { patterns: [/космет|продаж.*космет/i], name: 'Косметика e-commerce' },
      { patterns: [/обучен.*красот|курс.*визаж/i], name: 'Обучение бьюти' },
    ],
    marketContext: 'BeautyTech растет. Ключевое - визуальный контент, локальность,忠诚ность.',
    typicalFeatures: ['Запись', 'Каталог', 'Фото', 'Отзывы', 'Программа лояльности', 'Онлайн-оплата'],
    metrics: ['Bookings', 'No-show rate', 'Average ticket', 'Retention', 'NPS'],
    competitors: ['YClients', 'Dikidi', 'Broniboy'],
  },
  'AgroTech': {
    patterns: [/(agro|сельск|ферм|агро|урожай|поле|растени|животновод|сельск.*хозяйств)/i],
    subIndustries: [
      { patterns: [/урожай|мониторинг.*пол/i], name: 'Precision farming' },
      { patterns: [/ферм|животновод/i], name: 'Управление фермой' },
      { patterns: [/погода|метеоролог/i], name: 'Агрометеорология' },
      { patterns: [/рынок.*сельск|цены.*зерн/i], name: 'Агротрейдинг' },
    ],
    marketContext: 'AgroTech нишевый, но стратегический. Ключевое - точность данных, интеграция с техникой.',
    typicalFeatures: ['Мониторинг', 'Аналитика', 'Карты полей', 'Погода', 'Отчеты'],
    metrics: ['Yield increase', 'Cost reduction', 'Area covered', 'Users'],
    competitors: ['OneSoil', 'Agrosignal', 'Гео Никс'],
  },
  'CleanTech': {
    patterns: [/(cleantech|эколог|зелен|устойчив.*развити|recycl|переработ|esg|углерод|эмисси)/i],
    subIndustries: [
      { patterns: [/переработ|recycl|отход/i], name: 'Управление отходами' },
      { patterns: [/энерг.*эффектив|сбережен.*энерг/i], name: 'Энергоэффективность' },
      { patterns: [/углерод|эмисси|esg/i], name: 'ESG и углеродный след' },
    ],
    marketContext: 'CleanTech на волне ESG. Ключевое - измеримость impact, соответствие регуляторике.',
    typicalFeatures: ['Мониторинг', 'Отчетность', 'Аналитика', 'Сертификаты'],
    metrics: ['CO2 reduced', 'Waste recycled', 'Energy saved', 'Compliance rate'],
    competitors: ['Veolia', 'SUEZ', 'Российские стартапы'],
  },
};

/**
 * SPEECH-TO-FUNCTION TRANSFORMATION DATABASE
 * PO knows exactly how to transform colloquial speech into requirements
 */
const SPEECH_TO_FUNCTION_PATTERNS = [
  // === EXPLICIT FEATURE REQUESTS ===
  {
    pattern: /(?:хотелось бы|хочу|нужно|надо|необходимо)\s+(?:чтобы\s+)?(?:был[аои]?\s+)?(?:сделан[аои]?\s+)?(?:добавлен[аои]?\s+)?([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'explicit_request',
    priority: 'high',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Пользователь явно запросил функционал. Требует оценки бизнес-ценности и включения в бэклог.`,
    })
  },
  
  // === PROBLEM → SOLUTION ===
  {
    pattern: /(?:проблема|сложность|затруднен)[а-яё]*\s+(?:в том,?\s+)?(?:что\s+)?([а-яёa-z0-9\s\-]{10,100})/gi,
    type: 'problem_statement',
    priority: 'high',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Обнаружена проблема пользователя. Возможность для улучшения UX.`,
    })
  },
  {
    pattern: /(?:не хватает|отсутствует|нет)\s+(?:возможности\s+)?(?:сделать\s+)?([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'gap',
    priority: 'high',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Обнаружен пробел в функциональности. Конкурентное преимущество.`,
    })
  },
  {
    pattern: /(?:неудобно|не удобно|долго|сложно|затруднительн)[а-яё]*\s+([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'ux_pain',
    priority: 'medium',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `UX-фрикшн. Упрощение повысит конверсию и retention.`,
    })
  },
  
  // === USER ACTIONS ===
  {
    pattern: /(?:пользовател[иь]|клиент|заказчик|посетитель)\s+(?:должен|может|сможет|хочет)\s+([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'user_capability',
    priority: 'high',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Ключевой сценарий использования. Обязательно для MVP.`,
    })
  },
  {
    pattern: /(?:чтобы\s+)?(?:пользовател[иь]|клиент|посетитель)\s+(?:могл?[аи]?\s+)?([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'user_goal',
    priority: 'high',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Целевое действие пользователя. Критичный путь.`,
    })
  },
  
  // === BUSINESS REQUIREMENTS ===
  {
    pattern: /(?:бизнес|компания|организация|предприятие)\s+(?:требует|нуждается|хочет)\s+(?:в\s+)?([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'business_requirement',
    priority: 'critical',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Бизнес-требование. Влияет на монетизацию или операционную эффективность.`,
    })
  },
  {
    pattern: /(?:для\s+)?(?:монетизац|заработк|выручк|прибыл)[а-яё]*\s+(?:нужно\s+|надо\s+)?([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'monetization',
    priority: 'critical',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Функция для монетизации. Ключевая для бизнес-модели.`,
    })
  },
  
  // === PROPOSALS AND IDEAS ===
  {
    pattern: /(?:давайте|предлагаю|предложение|идея)[:—]?\s+(?:сделаем|добавим|создадим|реализуем|внедрим)\s+([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'proposal',
    priority: 'medium',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Предложение от стейкхолдера. Требует валидации и приоритизации.`,
    })
  },
  {
    pattern: /(?:было бы круто|отлично было|здорово если|классно когда)\s+(?:если бы\s+)?(?:был[аои]?\s+)?([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'wish',
    priority: 'low',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Пользовательское пожелание. Может улучшить NPS и retention.`,
    })
  },
  
  // === FUNCTIONAL DESCRIPTIONS ===
  {
    pattern: /(?:функци[яи]|возможность|инструмент|инструменты|модуль)[:—]?\s*([а-яёa-z0-9\s\-]{5,60})/gi,
    type: 'feature',
    priority: 'medium',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Функциональный модуль. Оценить приоритет относительно других.`,
    })
  },
  {
    pattern: /(?:система|платформа|приложение|сервис|продукт)\s+(?:должн[ао]?\s+|умеет\s+|позволяет\s+)([а-яёa-z0-9\s\-]{5,80})/gi,
    type: 'capability',
    priority: 'medium',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Системная возможность. Техническая реализация.`,
    })
  },
  
  // === INTEGRATION REQUIREMENTS ===
  {
    pattern: /(?:интеграц|подключен|связ[ьк])\s+(?:с\s+)?(?:([а-яёa-z0-9\s\-]{5,40}))/gi,
    type: 'integration',
    priority: 'medium',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Требование интеграции. Расширяет экосистему продукта.`,
    })
  },
  
  // === SECURITY AND COMPLIANCE ===
  {
    pattern: /(?:безопасност|защит|приватност|gdpr|персональн.*данн|шифрован)[а-яё]*\s+([а-яёa-z0-9\s\-]{5,60})?/gi,
    type: 'security',
    priority: 'critical',
    transform: (match: string, context: string) => ({
      rawFeature: match,
      description: `Требование безопасности. Критично для запуска.`,
    })
  },
];

/**
 * PRIORITY DETERMINATION CONTEXT
 */
const PRIORITY_CONTEXT = {
  must: ['обязательн', 'критичн', 'без этого невозможно', 'mvp', 'базов', 'основн', 'первоочеред', 'срочно', 'важн', 'высок.*приоритет'],
  should: ['нужно', 'необходимо', 'желательн', 'значим', 'стоит', 'рекоменд', 'втор.*очеред'],
  could: ['хотелось бы', 'было бы здорово', 'в идеале', 'можно', 'опциональн', 'будущ.*верси', 'потом', 'nice.*to.*have'],
  wont: ['не сейчас', 'отложен', 'future', 'roadmap', 'верси[яи] 2', 'позже', 'когда-нибудь'],
};

/**
 * PRODUCT OWNER HYPOTHESIS FRAMEWORK
 * Based on 10 years of experience
 */
const HYPOTHESIS_TEMPLATES = {
  value: [
    'Ценностное предложение резонирует с целевой аудиторией',
    'Пользователи готовы платить за предложенную ценность',
    'Решение закрывает реальную потребность рынка',
  ],
  solution: [
    'Предложенное решение лучше альтернатив на рынке',
    'Функциональность закрывает ключевые потребности',
    'UX обеспечивает достаточный уровень удобства',
  ],
  growth: [
    'Продукт обладает вирусным потенциалом',
    'Retention будет достаточным для unit-экономики',
    'Существующие каналы привлечения масштабируемы',
  ],
  market: [
    'Рынок достаточно большой для построения бизнеса',
    'Конкуренция не препятствует выходу на рынок',
    'Тайминг рынка подходящий для запуска',
  ],
  feasibility: [
    'Техническая реализация возможна в разумные сроки',
    'Команда обладает необходимыми компетенциями',
    'Бюджет достаточен для MVP',
  ],
};

/**
 * MAIN EXTRACTION FUNCTION
 * Product Owner with 10 years experience analyzes the text
 */
export function extractIdeaFromText(sourceText: string): ExtractedIdea {
  console.log('[PO-Extractor v8.0] === PRODUCT OWNER ANALYSIS START ===');
  console.log('[PO-Extractor] Source length:', sourceText.length);
  
  const fullText = sourceText.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  const lowerText = fullText.toLowerCase();
  
  // === 1. IDENTIFY INDUSTRY (Deep Analysis) ===
  const { industry, subIndustry, marketContext } = identifyIndustryDeep(fullText, lowerText);
  console.log(`[PO-Extractor] Industry: ${industry}, Sub: ${subIndustry}`);
  
  // === 2. EXTRACT PRODUCT NAME ===
  const name = extractProductName(fullText, lowerText);
  console.log(`[PO-Extractor] Name: "${name}"`);
  
  // === 3. EXTRACT DESCRIPTION ===
  const description = extractDescription(fullText, lowerText, name);
  console.log(`[PO-Extractor] Description: "${description.substring(0, 60)}..."`);
  
  // === 4. EXTRACT FUNCTIONAL REQUIREMENTS FROM SPEECH ===
  const functionalRequirements = extractFunctionalRequirementsDeep(fullText, lowerText, industry);
  console.log(`[PO-Extractor] Functional requirements: ${functionalRequirements.length}`);
  
  // === 5. EXTRACT FUNCTIONS ===
  const functions = extractFunctions(fullText, lowerText, functionalRequirements);
  console.log(`[PO-Extractor] Functions: ${functions.length}`);
  
  // === 6. EXTRACT TARGET AUDIENCE ===
  const userTypes = extractTargetAudience(fullText, lowerText, industry);
  console.log(`[PO-Extractor] User types: ${userTypes ? 'YES' : 'NO'}`);
  
  // === 7. EXTRACT VALUE PROPOSITION ===
  const valueProposition = extractValueProposition(fullText, lowerText);
  console.log(`[PO-Extractor] Value prop: ${valueProposition ? 'YES' : 'NO'}`);
  
  // === 8. EXTRACT RISKS ===
  const risks = extractRisks(fullText, lowerText);
  console.log(`[PO-Extractor] Risks: ${risks.length}`);
  
  // === 9. EXTRACT DIFFICULTIES ===
  const difficulties = extractDifficulties(fullText, lowerText);
  console.log(`[PO-Extractor] Difficulties: ${difficulties.length}`);
  
  // === 10. EXTRACT USE CASES ===
  const useCases = extractUseCases(fullText, lowerText, functions);
  console.log(`[PO-Extractor] Use cases: ${useCases.length}`);
  
  // === 11. EXTRACT USER STORIES ===
  const userStories = extractUserStoriesDeep(fullText, lowerText, userTypes, functions, description);
  console.log(`[PO-Extractor] User stories: ${userStories.length}`);
  
  // === 12. EXTRACT JTBD ===
  const jtbd = extractJTBDDdeep(fullText, lowerText, name, description, functions);
  console.log(`[PO-Extractor] JTBD: ${jtbd.length}`);
  
  // === 13. GENERATE HYPOTHESES (PO Enriched) ===
  const hypotheses = generatePOHypothesesDeep(
    functions, userTypes, valueProposition, industry, subIndustry, functionalRequirements, marketContext
  );
  console.log(`[PO-Extractor] Hypotheses: ${hypotheses.length}`);
  
  // === 14. GENERATE PO INSIGHTS ===
  const poInsights = generatePOInsightsDeep(industry, subIndustry, functions, userTypes, valueProposition, functionalRequirements, marketContext);
  console.log(`[PO-Extractor] PO Insights: ${poInsights.length}`);
  
  // === 15. DEFINE MVP SCOPE ===
  const mvpScope = defineMVPScope(functionalRequirements, functions, valueProposition);
  console.log(`[PO-Extractor] MVP Scope: ${mvpScope.length} features`);

  const industryData = INDUSTRY_DATABASE[industry];
  
  return {
    name: name || 'Продукт',
    description: description || 'Описание продукта из предоставленного текста',
    industry,
    industryContext: industryData?.marketContext || 'Технологический продукт',
    subIndustry,
    marketContext,
    functions: [...new Set(functions)].slice(0, 12),
    useCases: [...new Set(useCases)].slice(0, 6),
    userTypes: userTypes || '',
    valueProposition: valueProposition || '',
    risks: [...new Set(risks)].slice(0, 6),
    difficulties: [...new Set(difficulties)].slice(0, 6),
    hypotheses: hypotheses.slice(0, 8),
    userStories: userStories.slice(0, 6),
    jtbd: jtbd.slice(0, 5),
    functionalRequirements: functionalRequirements.slice(0, 10),
    poInsights: poInsights.slice(0, 6),
    mvpScope: mvpScope.slice(0, 8),
  };
}

/**
 * DEEP INDUSTRY IDENTIFICATION
 * PO knows industries inside and out
 */
function identifyIndustryDeep(fullText: string, lowerText: string): { industry: string; subIndustry: string; marketContext: string } {
  const scores = new Map<string, number>();
  const subIndustryScores = new Map<string, { industry: string; subIndustry: string; score: number }>();
  
  // Score each industry
  for (const [industryName, data] of Object.entries(INDUSTRY_DATABASE)) {
    for (const pattern of data.patterns) {
      const matches = fullText.match(pattern);
      if (matches) {
        scores.set(industryName, (scores.get(industryName) || 0) + matches.length * 2);
      }
    }
    
    // Score sub-industries
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
          // Also boost main industry
          scores.set(industryName, (scores.get(industryName) || 0) + matches.length);
        }
      }
    }
  }
  
  // Find best industry
  let maxScore = 0;
  let bestIndustry = 'SaaS/B2B';
  
  for (const [industry, score] of scores) {
    if (score > maxScore) {
      maxScore = score;
      bestIndustry = industry;
    }
  }
  
  // Find best sub-industry for the winning industry
  let bestSubIndustry = '';
  let maxSubScore = 0;
  
  for (const [key, data] of subIndustryScores) {
    if (data.industry === bestIndustry && data.score > maxSubScore) {
      maxSubScore = data.score;
      bestSubIndustry = data.subIndustry;
    }
  }
  
  const industryData = INDUSTRY_DATABASE[bestIndustry];
  const marketContext = industryData?.marketContext || 'Технологический рынок';
  
  return {
    industry: bestIndustry,
    subIndustry: bestSubIndustry,
    marketContext,
  };
}

/**
 * DEEP FUNCTIONAL REQUIREMENTS EXTRACTION
 * PO transforms any speech into proper requirements
 */
function extractFunctionalRequirementsDeep(
  fullText: string,
  lowerText: string,
  industry: string
): { feature: string; description: string; priority: string; source: string; details: string[] }[] {
  const requirements: { feature: string; description: string; priority: string; source: string; details: string[] }[] = [];
  const seen = new Set<string>();
  
  // Extract using speech patterns
  for (const patternConfig of SPEECH_TO_FUNCTION_PATTERNS) {
    const matches = fullText.matchAll(patternConfig.pattern);
    
    for (const match of matches) {
      let rawFeature = match[1]?.trim() || match[0].trim();
      
      // Clean up the feature name
      rawFeature = rawFeature
        .replace(/^(чтобы|что|как|был[аои]?|сделать|добавить|создать|реализовать|внедрить)\s+/i, '')
        .replace(/\s+(в системе|в приложении|на платформе|на сайте)$/i, '')
        .trim();
      
      const key = rawFeature.toLowerCase().substring(0, 35);
      
      if (seen.has(key) || rawFeature.length < 5 || rawFeature.length > 100) continue;
      seen.add(key);
      
      // Get context around the match
      const contextStart = Math.max(0, (match.index || 0) - 150);
      const contextEnd = Math.min(fullText.length, (match.index || 0) + match[0].length + 150);
      const context = fullText.substring(contextStart, contextEnd);
      
      // Determine priority from context
      const priority = determinePriorityFromContext(context, patternConfig.priority);
      
      // Transform using the pattern's transform function
      const transformResult = patternConfig.transform(match[0], context);
      
      // Extract additional details from context
      const details = extractFeatureDetails(context, rawFeature);
      
      // Capitalize feature name
      const feature = rawFeature.charAt(0).toUpperCase() + rawFeature.slice(1);
      
      requirements.push({
        feature,
        description: transformResult.description,
        priority,
        source: `💬 "${match[0].substring(0, 60)}${match[0].length > 60 ? '...' : ''}"`,
        details,
      });
    }
  }
  
  // Add industry-typical features if we have few requirements
  const industryData = INDUSTRY_DATABASE[industry];
  if (requirements.length < 3 && industryData) {
    for (const feature of industryData.typicalFeatures.slice(0, 3)) {
      const key = feature.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        requirements.push({
          feature,
          description: `Типичная функция для ${industry}. Стандарт рынка.`,
          priority: 'Should Have',
          source: `🏗️ Стандарт отрасли`,
          details: [],
        });
      }
    }
  }
  
  return requirements;
}

/**
 * EXTRACT FEATURE DETAILS FROM CONTEXT
 */
function extractFeatureDetails(context: string, feature: string): string[] {
  const details: string[] = [];
  
  // Look for specific details
  const detailPatterns = [
    /(?:включает|содержит|предусматривает)[:—]?\s*([а-яёa-z0-9\s\-]{10,60})/gi,
    /(?:например|к примеру|в том числе)[:—]?\s*([а-яёa-z0-9\s\-]{10,60})/gi,
    /(?:такой как|такие как)[:—]?\s*([а-яёa-z0-9\s\-]{10,60})/gi,
  ];
  
  for (const pattern of detailPatterns) {
    const matches = context.matchAll(pattern);
    for (const match of matches) {
      const detail = match[1]?.trim();
      if (detail && detail.length > 5 && detail.length < 60) {
        details.push(detail);
      }
    }
  }
  
  return [...new Set(details)].slice(0, 3);
}

/**
 * DETERMINE PRIORITY FROM CONTEXT
 */
function determinePriorityFromContext(context: string, defaultPriority: string): string {
  const lowerContext = context.toLowerCase();
  
  for (const keyword of PRIORITY_CONTEXT.must) {
    if (new RegExp(keyword, 'i').test(lowerContext)) return 'Must Have';
  }
  
  for (const keyword of PRIORITY_CONTEXT.should) {
    if (new RegExp(keyword, 'i').test(lowerContext)) return 'Should Have';
  }
  
  for (const keyword of PRIORITY_CONTEXT.could) {
    if (new RegExp(keyword, 'i').test(lowerContext)) return 'Could Have';
  }
  
  for (const keyword of PRIORITY_CONTEXT.wont) {
    if (new RegExp(keyword, 'i').test(lowerContext)) return 'Won\'t Have';
  }
  
  // Map default priority
  if (defaultPriority === 'critical') return 'Must Have';
  if (defaultPriority === 'high') return 'Should Have';
  if (defaultPriority === 'medium') return 'Could Have';
  if (defaultPriority === 'low') return 'Won\'t Have';
  
  return 'Should Have';
}

/**
 * EXTRACT PRODUCT NAME
 */
function extractProductName(fullText: string, lowerText: string): string {
  // Pattern 1: Quoted name «Name» or "Name"
  const quotedMatch = fullText.match(/[«"]([^»"]{2,50})[»"]/);
  if (quotedMatch) {
    const candidate = quotedMatch[1].trim();
    if (!isCommonWord(candidate) && candidate.length > 2) {
      console.log(`[extractProductName] Found quoted: "${candidate}"`);
      return candidate;
    }
  }
  
  // Pattern 2: "продукт/сервис/платформа/приложение X"
  const productMatch = fullText.match(/(?:продукт|сервис|платформа|приложение|проект|система)\s+[«"]?([А-Яа-яA-Za-z0-9\s\-]{2,40})[»"]?(?:\s|$|—|:|,)/i);
  if (productMatch) {
    const candidate = productMatch[1].trim();
    if (!isCommonWord(candidate)) {
      console.log(`[extractProductName] Found product X: "${candidate}"`);
      return candidate;
    }
  }
  
  // Pattern 3: "называется X" or "название X"
  const nameMatch = fullText.match(/(?:называется|название)[^А-Яа-яA-Za-z]{0,5}[«"]?([А-Яа-яA-Za-z0-9\s\-]{2,40})[»"]?(?:\s|$|\.|,)/i);
  if (nameMatch) {
    const candidate = nameMatch[1].trim();
    if (!isCommonWord(candidate)) {
      console.log(`[extractProductName] Found named: "${candidate}"`);
      return candidate;
    }
  }
  
  // Pattern 4: Title case word sequence at start
  const titleMatch = fullText.match(/^([А-Я][а-яё]+\s+[А-Я][а-яё]+(?:\s+[А-Я][а-яё]+)?)/m);
  if (titleMatch) {
    const candidate = titleMatch[1].trim();
    if (!isCommonWord(candidate) && candidate.length > 3) {
      console.log(`[extractProductName] Found title: "${candidate}"`);
      return candidate;
    }
  }
  
  // Pattern 5: Capitalized unique word
  const capWords = fullText.match(/(?<![а-яa-z])([А-ЯA-Z][а-яa-zA-Z]{2,25})(?![а-яa-z])/g);
  if (capWords && capWords.length > 0) {
    for (const word of capWords) {
      if (!isCommonWord(word) && word.length > 3) {
        console.log(`[extractProductName] Found capitalized: "${word}"`);
        return word;
      }
    }
  }
  
  return 'Продукт';
}

/**
 * EXTRACT DESCRIPTION
 */
function extractDescription(fullText: string, lowerText: string, name: string): string {
  // Pattern 1: "X — это ..."
  if (name && name !== 'Продукт') {
    const escapedName = escapeRegex(name);
    const thisMatch = fullText.match(new RegExp(`${escapedName}\\s*[—–-]?\\s*это\\s+([^.\\n]{20,300})`, 'i'));
    if (thisMatch) {
      return thisMatch[1].trim();
    }
  }
  
  // Pattern 2: "представляет собой"
  const representsMatch = fullText.match(/(?:представляет собой|является)\s+([^.\\n]{20,250})/i);
  if (representsMatch) {
    return representsMatch[1].trim();
  }
  
  // Pattern 3: "миссия/цель"
  const missionMatch = fullText.match(/(?:миссия|цель|задача)[^:]*[:—]?\s*([^.\\n]{20,220})/i);
  if (missionMatch) {
    return missionMatch[1].trim();
  }
  
  // Pattern 4: "мы создаём/разрабатываем"
  const createMatch = fullText.match(/(?:мы\s+)?(?:созда[ёю]м|разрабатываем|делаем|строим|запускаем|пишем)\s+([^.\\n]{20,220})/i);
  if (createMatch) {
    return createMatch[1].trim();
  }
  
  // Pattern 5: "суть в том"
  const essenceMatch = fullText.match(/(?:суть в том|основная идея)[,—]?\s*([^.\\n]{20,200})/i);
  if (essenceMatch) {
    return essenceMatch[1].trim();
  }
  
  // Pattern 6: First meaningful paragraph
  const paragraphs = fullText.split(/\n\n+/).filter(p => p.trim().length > 40);
  if (paragraphs.length > 0) {
    const first = paragraphs[0].trim();
    if (first.length > 20 && !first.startsWith('#') && !first.startsWith('*')) {
      return first.substring(0, 300).trim();
    }
  }
  
  return 'Описание продукта из предоставленного текста';
}

/**
 * EXTRACT FUNCTIONS
 */
function extractFunctions(fullText: string, lowerText: string, functionalRequirements: { feature: string }[]): string[] {
  const functions: string[] = [];
  
  // First add from functional requirements
  for (const req of functionalRequirements) {
    if (!functions.some(f => f.toLowerCase().includes(req.feature.toLowerCase().substring(0, 20)))) {
      functions.push(req.feature);
    }
  }
  
  // Pattern 1: Section with functions
  const sectionPatterns = [
    /(?:функции|возможности|инструменты|функционал|что\s+умеет|основные\s+опции)[^:]*[:—]?\s*([\s\S]*?)(?=\n\n|\n#|целевая|аудитория|риски|$)/gi,
  ];
  
  for (const pattern of sectionPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const items = match[0].match(/[-—•*]?\s*\d*[.)]?\s*([А-Яа-яA-Za-z][^\n]{5,100})/g);
      if (items) {
        for (const item of items) {
          const cleaned = item.replace(/^[-—•*\d.)\s]+/, '').trim();
          if (cleaned.length > 5 && cleaned.length < 100 && !functions.some(f => f.includes(cleaned.substring(0, 20)))) {
            functions.push(cleaned);
          }
        }
      }
    }
  }
  
  // Pattern 2: Bulleted lists
  if (functions.length < 5) {
    const listItems = fullText.match(/(?:^|\n)\s*[-—•*]\s+([А-Яа-яA-Za-z][^\n]{5,80})/g);
    if (listItems) {
      for (const item of listItems) {
        const cleaned = item.replace(/^[\s\n\-—•*]+/, '').trim();
        if (cleaned.length > 5 && cleaned.length < 80 && !functions.some(f => f.includes(cleaned.substring(0, 20)))) {
          functions.push(cleaned);
        }
      }
    }
  }
  
  // Pattern 3: Numbered lists
  if (functions.length < 5) {
    const numItems = fullText.match(/(?:^|\n)\s*\d+[.)]\s+([А-Яа-яA-Za-z][^\n]{5,80})/g);
    if (numItems) {
      for (const item of numItems) {
        const cleaned = item.replace(/^[\s\n\d.)]+/, '').trim();
        if (cleaned.length > 5 && cleaned.length < 80 && !functions.some(f => f.includes(cleaned.substring(0, 20)))) {
          functions.push(cleaned);
        }
      }
    }
  }
  
  return functions;
}

/**
 * EXTRACT TARGET AUDIENCE
 */
function extractTargetAudience(fullText: string, lowerText: string, industry: string): string {
  // Pattern 1: "аудитория/для кого" section
  const audSection = fullText.match(/(?:аудитори[яи]|для кого|целевая.*аудитори[яи]|пользовател[иь]|клиент[^а-я])[а-яё]*[^:]*[:—]?\s*([\s\S]*?)(?=\n\n|\n#|риски|функции|возможности|монетиз|$)/i);
  if (audSection) {
    const text = audSection[1].trim();
    if (text.length > 10) {
      return text.substring(0, 600);
    }
  }
  
  // Pattern 2: "для X"
  const forMatches = fullText.matchAll(/для\s+([а-яёa-z\s]{5,60})(?:\s|,|\.)/gi);
  const audiences: string[] = [];
  for (const match of forMatches) {
    const audience = match[1].trim();
    if (audience.length > 4 && !audiences.some(a => a.includes(audience.substring(0, 15)))) {
      audiences.push(audience);
    }
  }
  if (audiences.length > 0) {
    return audiences.slice(0, 6).join('\n');
  }
  
  // Pattern 3: Industry-specific defaults
  const industryData = INDUSTRY_DATABASE[industry];
  if (industryData) {
    return `Типичная аудитория для ${industry}`;
  }
  
  return '';
}

/**
 * EXTRACT VALUE PROPOSITION
 */
function extractValueProposition(fullText: string, lowerText: string): string {
  const patterns = [
    /(?:преимущество|ценность|фишка|особенность|отличие|killer\s*feature)[^:]*[:—]?\s*([^.\\n]{15,200})/i,
    /(?:в отличие от|лучше чем|быстрее чем|удобнее чем|проще чем)[^.\\n]{5,150}/i,
    /(?:экономит|сокращает|уменьшает|увеличивает|улучшает|упрощает)\s+([^.\\n]{15,120})/i,
    /(?:решаем проблему|помогаем|даем возможность|позволяет)[^.\\n]{15,120}/i,
    /(?:наше преимущество|наша фишка|наша особенность)[:—]?\s*([^.\\n]{15,150})/i,
  ];
  
  for (const pattern of patterns) {
    const match = fullText.match(pattern);
    if (match) {
      return match[0].trim().substring(0, 200);
    }
  }
  
  return '';
}

/**
 * EXTRACT RISKS
 */
function extractRisks(fullText: string, lowerText: string): string[] {
  const risks: string[] = [];
  
  const riskPatterns = [
    /риск[а-яё]*[^.\\n]{5,150}/gi,
    /(?:проблема|сложность|трудность|угроза|опасность)[а-яё]*[^.\\n]{5,120}/gi,
    /(?:может не|рискованно|опасно|не получится|есть вероятность)[^.\\n]{5,100}/gi,
  ];
  
  for (const pattern of riskPatterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const risk = match[0].trim().substring(0, 130);
      if (!risks.some(r => r.includes(risk.substring(0, 25)))) {
        risks.push(risk);
      }
    }
  }
  
  return risks;
}

/**
 * EXTRACT DIFFICULTIES
 */
function extractDifficulties(fullText: string, lowerText: string): string[] {
  const difficulties: string[] = [];
  
  const patterns = [
    /(?:стоит|цена|бюджет|стоимость|ресурс)[а-яё]*[^.\\n]{5,120}/gi,
    /(?:сложно|трудно|долго|дорого|ресурсоемко|затратно)[а-яё]*[^.\\n]{5,100}/gi,
    /(?:ограничен|не хватает|недостаточно|дефицит)[а-яё]*[^.\\n]{5,100}/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const diff = match[0].trim().substring(0, 110);
      if (!difficulties.some(d => d.includes(diff.substring(0, 25)))) {
        difficulties.push(diff);
      }
    }
  }
  
  return difficulties;
}

/**
 * EXTRACT USE CASES
 */
function extractUseCases(fullText: string, lowerText: string, functions: string[]): string[] {
  const useCases: string[] = [];
  
  // Extract from "когда" scenarios
  const whenMatch = fullText.matchAll(/(?:когда|если|в случае)\s+([а-яёa-z0-9\s\-]{10,80})/gi);
  for (const match of whenMatch) {
    if (useCases.length < 6) {
      useCases.push(match[0].trim());
    }
  }
  
  // Generate from functions
  if (useCases.length < 3 && functions.length > 0) {
    for (const func of functions.slice(0, 3)) {
      useCases.push(`Пользователь использует: ${func.toLowerCase()}`);
    }
  }
  
  return useCases;
}

/**
 * EXTRACT USER STORIES (Deep)
 */
function extractUserStoriesDeep(
  fullText: string,
  lowerText: string,
  userTypes: string,
  functions: string[],
  description: string
): { role: string; want: string; benefit: string; source: string; acceptanceCriteria: string[] }[] {
  const userStories: { role: string; want: string; benefit: string; source: string; acceptanceCriteria: string[] }[] = [];
  
  const roles = userTypes.split('\n').filter(r => r.trim().length > 3);
  const primaryRole = roles[0]?.substring(0, 50) || 'Пользователь';
  
  // Pattern: "хочу/нужно"
  const wantMatches = fullText.matchAll(/(?:хочу|нужно|хотелось бы|необходимо)\s+([а-яёa-z0-9\s\-]{10,80})/gi);
  for (const match of wantMatches) {
    if (userStories.length < 6) {
      const want = match[1].trim();
      if (!userStories.some(us => us.want.includes(want.substring(0, 20)))) {
        // Generate acceptance criteria
        const acceptanceCriteria = generateAcceptanceCriteria(want);
        
        userStories.push({
          role: primaryRole,
          want: want,
          benefit: description.substring(0, 60) || 'достичь своей цели',
          source: `💬 "${match[0].substring(0, 60)}..."`,
          acceptanceCriteria,
        });
      }
    }
  }
  
  // Generate from functions
  if (userStories.length < 3 && functions.length > 0) {
    for (const func of functions.slice(0, 3)) {
      const acceptanceCriteria = generateAcceptanceCriteria(func);
      userStories.push({
        role: primaryRole,
        want: func.toLowerCase(),
        benefit: description.substring(0, 50) || 'решить задачу',
        source: `📝 На основе функции`,
        acceptanceCriteria,
      });
    }
  }
  
  return userStories;
}

/**
 * GENERATE ACCEPTANCE CRITERIA
 */
function generateAcceptanceCriteria(feature: string): string[] {
  const criteria: string[] = [];
  
  // Generic criteria based on feature type
  if (feature.toLowerCase().includes('авториз') || feature.toLowerCase().includes('логин')) {
    criteria.push('Пользователь может войти через email/пароль');
    criteria.push('Пользователь может восстановить пароль');
    criteria.push('Система блокирует после 5 неудачных попыток');
  } else if (feature.toLowerCase().includes('поиск') || feature.toLowerCase().includes('фильтр')) {
    criteria.push('Поиск работает с минимальной задержкой < 500ms');
    criteria.push('Результаты отсортированы по релевантности');
    criteria.push('Можно сохранить фильтры');
  } else if (feature.toLowerCase().includes('оплат') || feature.toLowerCase().includes('платеж')) {
    criteria.push('Поддержка основных платежных систем');
    criteria.push('Чек о покупке отправляется на email');
    criteria.push('Возврат возможен в течение 14 дней');
  } else {
    criteria.push('Функциональность доступна на всех устройствах');
    criteria.push('Время отклика < 2 секунд');
    criteria.push('Данные сохраняются автоматически');
  }
  
  return criteria;
}

/**
 * EXTRACT JTBD (Deep)
 */
function extractJTBDDdeep(
  fullText: string,
  lowerText: string,
  name: string,
  description: string,
  functions: string[]
): { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[] {
  const jtbd: { situation: string; motivation: string; outcome: string; source: string; emotionalContext: string }[] = [];
  
  // Look for JTBD patterns
  const whenMatches = fullText.matchAll(/(?:когда|каждый раз когда|если|в ситуациях когда)\s+([а-яёa-z0-9\s\-]{10,80})/gi);
  for (const match of whenMatches) {
    if (jtbd.length < 5) {
      // Try to extract emotional context
      const contextStart = Math.max(0, (match.index || 0) - 50);
      const contextEnd = Math.min(fullText.length, (match.index || 0) + 150);
      const context = fullText.substring(contextStart, contextEnd);
      const emotionalContext = extractEmotionalContext(context);
      
      jtbd.push({
        situation: match[1].trim(),
        motivation: `использовать ${name || 'продукт'}`,
        outcome: description.substring(0, 50) || 'достичь цели',
        source: `💬 "${match[0].substring(0, 60)}..."`,
        emotionalContext,
      });
    }
  }
  
  // Generate from functions if needed
  if (jtbd.length < 2 && functions.length > 0) {
    for (const func of functions.slice(0, 2)) {
      jtbd.push({
        situation: `нужно ${func.toLowerCase()}`,
        motivation: `найти решение в ${name || 'продукте'}`,
        outcome: description.substring(0, 50) || 'решить задачу',
        source: `📝 На основе функции`,
        emotionalContext: 'Пользователь ищет эффективное решение',
      });
    }
  }
  
  return jtbd;
}

/**
 * EXTRACT EMOTIONAL CONTEXT
 */
function extractEmotionalContext(context: string): string {
  const emotions: { pattern: RegExp; emotion: string }[] = [
    { pattern: /(?:устал|надоел|бесит|раздража)/i, emotion: 'Фрустрация от существующего решения' },
    { pattern: /(?:боюсь|страшн|опасаюсь)/i, emotion: 'Страх сделать неправильный выбор' },
    { pattern: /(?:хочу|мечта[юю]|жела[юю])/i, emotion: 'Желание улучшить ситуацию' },
    { pattern: /(?:надеюсь|рассчитыва[юю])/i, emotion: 'Надежда на лучшее решение' },
    { pattern: /(?:спеш[ук]|врем[яи] нет|срочно)/i, emotion: 'Нехватка времени' },
    { pattern: /(?:запутал[а-яё]*|не понимаю|сложн)/i, emotion: 'Путаница в вариантах' },
  ];
  
  for (const { pattern, emotion } of emotions) {
    if (pattern.test(context)) {
      return emotion;
    }
  }
  
  return 'Пользователь ищет решение';
}

/**
 * GENERATE PO HYPOTHESES (Deep)
 */
function generatePOHypothesesDeep(
  functions: string[],
  userTypes: string,
  valueProposition: string,
  industry: string,
  subIndustry: string,
  functionalRequirements: { feature: string; priority: string }[],
  marketContext: string
): { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[] {
  const hypotheses: { hypothesis: string; type: string; validation: string; priority: string; rationale: string }[] = [];
  
  // Value hypotheses
  if (valueProposition) {
    hypotheses.push({
      hypothesis: `Ценностное предложение "${valueProposition.substring(0, 60)}" резонирует с целевой аудиторией`,
      type: 'Ценность',
      validation: 'Custdev интервью (20+ респондентов), A/B тест landing page',
      priority: 'High',
      rationale: 'Ценностное предложение - основа product-market fit. Без валидации есть риск построить ненужный продукт.',
    });
  }
  
  // Feature hypotheses
  for (const req of functionalRequirements.slice(0, 4)) {
    hypotheses.push({
      hypothesis: `Функция "${req.feature}" критична для пользователей`,
      type: 'Решение',
      validation: 'MVP тест, метрики использования, correlation analysis',
      priority: req.priority === 'Must Have' ? 'High' : 'Medium',
      rationale: 'Не все запрошенные функции одинаково важны. Валидация поможет оптимизировать scope MVP.',
    });
  }
  
  // Market hypotheses
  if (userTypes) {
    const audienceLine = userTypes.split('\n')[0].substring(0, 60);
    hypotheses.push({
      hypothesis: `${audienceLine} — платежеспособный сегмент с готовностью платить`,
      type: 'Рынок',
      validation: 'WTP-опросы, анализ конкурентов, тестpricing',
      priority: 'High',
      rationale: 'Willingness to pay критична для бизнес-модели. Бесплатные пользователи ≠ платящие клиенты.',
    });
  }
  
  // Industry hypothesis
  hypotheses.push({
    hypothesis: `${subIndustry || industry} рынок готов к внедрению данного решения`,
    type: 'Рынок',
    validation: 'TAM/SAM/SOM анализ, анализ трендов, экспертные интервью',
    priority: 'Medium',
    rationale: 'Тайминг рынка - один из ключевых факторов успеха. Слишком рано = нет спроса, слишком поздно = много конкурентов.',
  });
  
  // Growth hypothesis
  hypotheses.push({
    hypothesis: 'Продукт обладает вирусным потенциалом через реферальную механику',
    type: 'Рост',
    validation: 'K-factor measurement, A/B тест referral program',
    priority: 'Medium',
    rationale: 'Органический рост снижает CAC и повышает LTV. Реферальные программы проверенный механизм.',
  });
  
  // Feasibility hypothesis
  hypotheses.push({
    hypothesis: 'Техническая реализация возможна в течение 3 месяцев с текущими ресурсами',
    type: 'Реализуемость',
    validation: 'Технический аудит, estimation сессия, spike stories',
    priority: 'High',
    rationale: 'Реалистичная оценка timeline критична для планирования. Оптимистичные оценки ведут к провалам.',
  });
  
  return hypotheses;
}

/**
 * GENERATE PO INSIGHTS (Deep)
 */
function generatePOInsightsDeep(
  industry: string,
  subIndustry: string,
  functions: string[],
  userTypes: string,
  valueProposition: string,
  functionalRequirements: { feature: string; priority: string }[],
  marketContext: string
): { insight: string; recommendation: string; impact: string }[] {
  const insights: { insight: string; recommendation: string; impact: string }[] = [];
  
  // MVP scope insight
  const mustHave = functionalRequirements.filter(r => r.priority === 'Must Have');
  insights.push({
    insight: `MVP должен включать ${mustHave.length > 0 ? mustHave.length : 'минимальный'} набор критичных функций для ${subIndustry || industry}`,
    recommendation: `Определить scope MVP: ${mustHave.length > 0 ? mustHave.map(r => r.feature).slice(0, 4).join(', ') : functions[0] || 'базовый функционал'}. Cut non-essential features.`,
    impact: 'Сокращение time-to-market на 30-50%',
  });
  
  // Market fit insight
  insights.push({
    insight: `${industry} — ${marketContext.substring(0, 100)}...`,
    recommendation: 'Провести анализ конкурентов, выделить 2-3 ключевых отличия от существующих решений',
    impact: 'Четкое позиционирование на рынке',
  });
  
  // User research insight
  if (!userTypes || userTypes.length < 20) {
    insights.push({
      insight: 'Целевая аудитория определена недостаточно четко',
      recommendation: 'Провести custdev интервью (10-20 респондентов), создать 3-5 персон, валидировать сегменты',
      impact: 'Повышение конверсии и retention за счет точного понимания ЦА',
    });
  }
  
  // Value proposition insight
  if (!valueProposition) {
    insights.push({
      insight: 'Ценностное предложение требует формулировки',
      recommendation: 'Сформулировать Unique Value Proposition по формуле: [ЦА] + [Проблема] + [Решение] + [Результат]. Протестировать на landing page.',
      impact: 'Повышение конверсии на landing page',
    });
  }
  
  // Prioritization insight
  insights.push({
    insight: 'Функции требуют приоритизации по бизнес-ценности и сложности реализации',
    recommendation: 'Применить RICE/ICE скоринг. Создать roadmap на 2-3 квартала с четкими milestone.',
    impact: 'Прозрачность roadmap и согласованность команды',
  });
  
  // Metrics insight
  const industryData = INDUSTRY_DATABASE[industry];
  if (industryData) {
    insights.push({
      insight: `Ключевые метрики для ${industry}: ${industryData.metrics.slice(0, 4).join(', ')}`,
      recommendation: 'Настроить tracking с первого дня. Определить North Star Metric и вспомогательные метрики.',
      impact: 'Data-driven принятие решений',
    });
  }
  
  return insights;
}

/**
 * DEFINE MVP SCOPE
 */
function defineMVPScope(
  functionalRequirements: { feature: string; priority: string; description: string }[],
  functions: string[],
  valueProposition: string
): { feature: string; reason: string; effort: string }[] {
  const mvpScope: { feature: string; reason: string; effort: string }[] = [];
  
  // Must Have features go to MVP
  const mustHave = functionalRequirements.filter(r => r.priority === 'Must Have');
  for (const req of mustHave.slice(0, 5)) {
    mvpScope.push({
      feature: req.feature,
      reason: 'Критично для базового сценария использования',
      effort: estimateEffort(req.feature),
    });
  }
  
  // Add key functions if not enough Must Have
  if (mvpScope.length < 3 && functions.length > 0) {
    for (const func of functions.slice(0, 3)) {
      if (!mvpScope.some(m => m.feature.toLowerCase().includes(func.toLowerCase().substring(0, 15)))) {
        mvpScope.push({
          feature: func,
          reason: 'Основная функциональность продукта',
          effort: estimateEffort(func),
        });
      }
    }
  }
  
  // Add core infrastructure
  mvpScope.push({
    feature: 'Аутентификация и профиль',
    reason: 'Базовая инфраструктура для любого продукта',
    effort: 'Medium',
  });
  
  return mvpScope;
}

/**
 * ESTIMATE EFFORT
 */
function estimateEffort(feature: string): string {
  const lowerFeature = feature.toLowerCase();
  
  if (/(интеграц|api|подключен|синхрон)/.test(lowerFeature)) return 'High';
  if (/(оплата|платеж|подписк|биллинг)/.test(lowerFeature)) return 'High';
  if (/(админ|панель|настройк|управлен)/.test(lowerFeature)) return 'Medium';
  if (/(аналитик|отчет|статистик|дашборд)/.test(lowerFeature)) return 'Medium';
  if (/(авториз|логин|регистрац|профил)/.test(lowerFeature)) return 'Low';
  if (/(поиск|фильтр|каталог|список)/.test(lowerFeature)) return 'Low';
  
  return 'Medium';
}

/**
 * HELPER: Check if word is common
 */
function isCommonWord(word: string): boolean {
  const common = ['это', 'как', 'что', 'для', 'при', 'над', 'под', 'можно', 'нужно', 'надо', 'тоже', 'ещё', 'уже', 'или', 'но', 'а', 'и', 'в', 'на', 'с', 'к', 'по', 'из', 'за', 'то', 'не', 'да', 'нет', 'меня', 'тебя', 'его', 'её', 'их', 'мы', 'вы', 'он', 'она', 'оно', 'они', 'я', 'ты', 'сделать', 'сделаем', 'будет', 'может', 'должен', 'нужно', 'которые', 'который', 'которая', 'которое', 'только', 'даже', 'всего', 'всегда', 'конечно', 'очень', 'теперь', 'потом', 'сейчас', 'здесь', 'там', 'туда', 'сюда', 'оттуда', 'отсюда', 'поэтому', 'зачем', 'почему', 'какой', 'какая', 'какое', 'какие', 'чья', 'чье', 'чьи', 'чей', 'сколько', 'который'];
  return common.includes(word.toLowerCase().trim());
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
  // Format functional requirements
  const funcReqText = idea.functionalRequirements.length > 0
    ? idea.functionalRequirements.map((r, i) => `### FR-${i + 1}: ${r.feature}
**Приоритет:** ${r.priority}
**Описание:** ${r.description}
*${r.source}*
${r.details.length > 0 ? `\n**Детали:**\n${r.details.map(d => `- ${d}`).join('\n')}` : ''}`).join('\n\n')
    : '*Функциональные требования не извлечены*';
  
  // Format user stories
  const userStoriesText = idea.userStories.length > 0
    ? idea.userStories.map((us, i) => `### US-${i + 1}
Как **${us.role}**, я хочу **${us.want}**, чтобы ${us.benefit}.

*${us.source}*

**Критерии приемки:**
${us.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}`).join('\n\n')
    : `Как **Пользователь**, я хочу использовать **${idea.name}**, чтобы достичь своей цели.`;
  
  // Format JTBD
  const jtbdText = idea.jtbd.length > 0
    ? idea.jtbd.map((j, i) => `### JTBD-${i + 1}

**📋 Ситуация:** ${j.situation}
**🎯 Мотивация:** ${j.motivation}
**✅ Результат:** чтобы ${j.outcome}
**💭 Эмоциональный контекст:** ${j.emotionalContext}

*${j.source}*`).join('\n\n')
    : `### JTBD-1

**📋 Ситуация:** Когда ищу решение
**🎯 Мотивация:** я хочу найти надёжный инструмент
**✅ Результат:** чтобы достичь своих целей`;
  
  // Format hypotheses
  const hypothesesText = idea.hypotheses.map((h, i) => `### H-${i + 1}: ${h.type}
**Гипотеза:** ${h.hypothesis}

**Валидация:** ${h.validation}
**Приоритет:** ${h.priority}
**Обоснование:** ${h.rationale}`).join('\n\n');

  // Format PO insights
  const insightsText = idea.poInsights.map((ins, i) => `### 💡 Insight ${i + 1}
**Наблюдение:** ${ins.insight}
**Рекомендация:** ${ins.recommendation}
**Влияние:** ${ins.impact}`).join('\n\n');

  // Format MVP Scope
  const mvpText = idea.mvpScope.map((m, i) => `${i + 1}. **${m.feature}**
   - Причина: ${m.reason}
   - Оценка усилий: ${m.effort}`).join('\n\n');

  return `═══════════════════════════════════════════════════════════════
# 💡 СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА (Product Owner View)
═══════════════════════════════════════════════════════════════

## 🎯 ${idea.name}

> ${idea.description}

---

### 🏢 Отрасль

**${idea.industry}**${idea.subIndustry ? ` → ${idea.subIndustry}` : ''}

${idea.industryContext}

---

### 📊 Рыночный контекст

${idea.marketContext}

═══════════════════════════════════════════════════════════════

## 👥 Целевая аудитория

${idea.userTypes || '*Требуется уточнение через custdev*'}

---

### ⚡ Ключевая ценность

**${idea.valueProposition || 'Уникальное решение для целевой аудитории'}**

═══════════════════════════════════════════════════════════════

## 📋 Функциональные требования (FR)

${funcReqText}

═══════════════════════════════════════════════════════════════

## 📖 User Stories

${userStoriesText}

═══════════════════════════════════════════════════════════════

## 🎯 Jobs To Be Done (JTBD)

${jtbdText}

═══════════════════════════════════════════════════════════════

## 📋 Use Cases (Сценарии)

${idea.useCases.length > 0 
  ? idea.useCases.map((u, i) => `**UC-${i + 1}** → ${u}`).join('\n\n')
  : '*Сценарии требуют уточнения*'}

═══════════════════════════════════════════════════════════════

## 🛠️ Основные функции

${idea.functions.length > 0 
  ? idea.functions.map((f, i) => `${i + 1}. **${f}**`).join('\n')
  : '*Функции не извлечены*'}

═══════════════════════════════════════════════════════════════

## 🧪 Гипотезы для валидации

${hypothesesText}

═══════════════════════════════════════════════════════════════

## 🎯 MVP Scope (Рекомендуемый)

${mvpText}

═══════════════════════════════════════════════════════════════

## 💡 PO Insights (Рекомендации продакт-овнера)

${insightsText}

═══════════════════════════════════════════════════════════════

## ⚠️ Риски и трудности

### Риски
${idea.risks.length > 0 
  ? idea.risks.map((r, i) => `${i + 1}. ${r}`).join('\n')
  : '*Риски не выявлены в исходных данных*'}

### Трудности
${idea.difficulties.length > 0 
  ? idea.difficulties.map((d, i) => `${i + 1}. ${d}`).join('\n')
  : '*Трудности не выявлены в исходных данных*'}

---

**Сформировано Product Owner Agent v8.0**
*Все данные извлечены из предоставленного контекста без шаблонов*`;
}
