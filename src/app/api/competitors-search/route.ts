import { NextRequest, NextResponse } from 'next/server';
import { extractIdeaFromText } from '@/lib/idea-extractor';
import { 
  analyzeCompetitors, 
  formatCompetitorAnalysisAsMarkdown 
} from '@/lib/competitor-analyzer';

// === КОНФИГУРАЦИЯ ===

// База знаний о конкурентах по категориям
const COMPETITORS_KNOWLEDGE_BASE: Record<string, {
  russian: Array<{
    name: string;
    url: string;
    description: string;
    features: string[];
    pricing: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  international: Array<{
    name: string;
    url: string;
    description: string;
    features: string[];
    pricing: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  marketTrends: string[];
  marketSize: string;
}> = {
  // Аквариумистика / Зоотовары
  aquarium: {
    russian: [
      {
        name: 'AquaLogo',
        url: 'https://aqualogo.ru',
        description: 'Крупнейший интернет-магазин аквариумистики в России. Широкий ассортимент рыб, растений и оборудования.',
        features: ['Каталог рыб и растений', 'Оборудование для аквариумов', 'Онлайн-заказ', 'Доставка по РФ', 'Блог и статьи'],
        pricing: 'Розничные цены, скидки для постоянных клиентов',
        strengths: ['Широкий ассортимент', 'Доставка по РФ', 'Блог и статьи', 'Филиалы в городах', 'Консультации'],
        weaknesses: ['Устаревший дизайн сайта', 'Нет бронирования', 'Слабые фильтры поиска', 'Нет мобильного приложения']
      },
      {
        name: 'Akvarimir',
        url: 'https://akvarimir.ru',
        description: 'Сеть магазинов аквариумистики с онлайн-продажами. Специализация на живом товаре.',
        features: ['Живой товар', 'Оборудование', 'Корма', 'Самовывоз и доставка', 'Консультации'],
        pricing: 'Средние рыночные цены',
        strengths: ['Живой товар в наличии', 'Офлайн-магазины', 'Консультации специалистов', 'Самовывоз'],
        weaknesses: ['Ограниченная география', 'Слабый сайт', 'Мало фото/видео контента', 'Ограниченная доставка']
      },
      {
        name: 'Avito (аквариумистика)',
        url: 'https://avito.ru',
        description: 'Доска объявлений с разделами аквариумистики. Частные объявления и магазины.',
        features: ['Частные объявления', 'Живой товар', 'Оборудование', 'Локальный поиск', 'Прямой контакт'],
        pricing: 'Бесплатно / Платное продвижение',
        strengths: ['Бесплатно', 'Локальный поиск', 'Много предложений', 'Прямой контакт с продавцом'],
        weaknesses: ['Нет гарантии', 'Нет доставки живого товара', 'Риск обмана', 'Нет каталога']
      }
    ],
    international: [
      {
        name: 'LiveAquaria',
        url: 'https://liveaquaria.com',
        description: 'Крупнейший онлайн-магазин аквариумистики в США.',
        features: ['Тропические рыбы', 'Морские рыбы', 'Кораллы', 'Оборудование', 'Гарантия здоровья'],
        pricing: 'от $20 за рыбу',
        strengths: ['Огромный выбор', 'Гарантия здоровья', 'Качественный контент', 'Бренд'],
        weaknesses: ['Нет доставки в РФ', 'Цена', 'Нет русского языка', 'Санкции']
      },
      {
        name: 'Aquarium Co-Op',
        url: 'https://aquariumcoop.com',
        description: 'Популярный магазин аквариумистики с обучающим контентом.',
        features: ['Растения', 'Рыбы', 'Оборудование', 'Обучающие видео', 'Сообщество'],
        pricing: 'Средние цены',
        strengths: ['Контент', 'Сообщество', 'Качество', 'YouTube канал'],
        weaknesses: ['Нет в РФ', 'Ограниченный ассортимент', 'Нет русского']
      }
    ],
    marketTrends: [
      'Премиум сегмент с редкими видами рыб',
      'Онлайн-продажи с доставкой',
      'Видео-контент и обучение',
      'Консультации онлайн',
      'Акваскейпинг и дизайн',
      'Умные системы фильтрации'
    ],
    marketSize: '$5 млрд глобально, $100 млн в РФ'
  },
  
  // Виртуальная АТС / Телефония
  ats: {
    russian: [
      {
        name: 'Манго Офис',
        url: 'https://mango-office.ru',
        description: 'Один из лидеров рынка виртуальных АТС в России. Облачная телефония с интеграцией CRM и аналитикой звонков.',
        features: ['Виртуальная АТС', 'Интеграция с CRM (Битрикс24, AmoCRM)', 'Запись звонков', 'IVR меню', 'Аналитика звонков', 'Мобильное приложение'],
        pricing: 'от 650₽/мес за пользователя',
        strengths: ['Локализация для РФ', 'Интеграция с российскими CRM', 'Техподдержка на русском', 'Работа с российскими операторами', 'Быстрый старт'],
        weaknesses: ['Ограниченный функционал аналитики', 'Устаревший интерфейс', 'Сложность настройки интеграций', 'Нет API для кастомных интеграций']
      },
      {
        name: 'UIS (Юждес)',
        url: 'https://uiscom.ru',
        description: 'Комплексная платформа для контакт-центров и виртуальной телефонии с глубокой аналитикой.',
        features: ['Виртуальная АТС', 'Контакт-центр', 'Интеграция CRM', 'Аналитика и отчёты', 'Омниканальность', 'Speech Analytics'],
        pricing: 'от 600₽/мес',
        strengths: ['Мощный контакт-центр', 'Глубокая аналитика', 'Множество интеграций', 'Speech Analytics', 'Омниканальность'],
        weaknesses: ['Сложность для новичков', 'Высокая цена расширенных функций', 'Долгое внедрение', 'Требует обучения']
      },
      {
        name: 'Telphin',
        url: 'https://telphin.ru',
        description: 'Бюджетное решение для виртуальной АТС с базовым функционалом.',
        features: ['Виртуальная АТС', 'SIP-телефония', 'Интеграция с 1С', 'Запись разговоров', 'IVR'],
        pricing: 'от 290₽/мес',
        strengths: ['Низкая цена', 'Простота настройки', 'Интеграция с 1С', 'Быстрый старт'],
        weaknesses: ['Базовый функционал', 'Ограниченная аналитика', 'Старый UI', 'Нет мобильного приложения']
      },
      {
        name: 'Rostelcom (Виртуальная АТС)',
        url: 'https://rt.ru/b2b/vats',
        description: 'Решение от крупного российского оператора с интеграцией в экосистему Ростелекома.',
        features: ['Виртуальная АТС', 'Интеграция с сервисами Ростелекома', 'Запись звонков', 'IVR', 'Аналитика'],
        pricing: 'от 500₽/мес',
        strengths: ['Надёжность оператора', 'Интеграция с экосистемой', 'Техподдержка', 'Покрытие по всей России'],
        weaknesses: ['Сложность подключения', 'Ограниченный функционал', 'Долгое время реакции']
      },
      {
        name: 'Yandex.Телефония',
        url: 'https://telephony.yandex.ru',
        description: 'Виртуальная АТС от Яндекс с интеграцией в экосистему Yandex Cloud.',
        features: ['Виртуальная АТС', 'Интеграция с Яндекс.Трекером', 'Запись звонков', 'Yandex SpeechKit', 'Аналитика'],
        pricing: 'от 400₽/мес',
        strengths: ['Интеграция с Яндекс', 'SpeechKit для анализа', 'Современный интерфейс', 'Масштабируемость'],
        weaknesses: ['Ограниченные CRM интеграции', 'Требует Yandex Cloud', 'Нет интеграции с российскими CRM']
      }
    ],
    international: [
      {
        name: 'RingCentral',
        url: 'https://ringcentral.com',
        description: 'Глобальный лидер облачной телефонии для бизнеса.',
        features: ['Cloud PBX', 'Video conferencing', 'Team messaging', 'Integrations', 'Analytics', 'Mobile app'],
        pricing: 'от $20/мес',
        strengths: ['Global presence', 'Rich feature set', 'API ecosystem', 'Enterprise grade'],
        weaknesses: ['Высокая цена', 'Нет локализации', 'Нет российских номеров', 'Санкции']
      },
      {
        name: 'Aircall',
        url: 'https://aircall.io',
        description: 'Современная облачная телефония для sales-команд.',
        features: ['Cloud call center', 'CRM integration', 'Analytics', 'Click-to-call', 'Recording', 'IVR'],
        pricing: 'от $30/мес',
        strengths: ['Modern UI', 'Great integrations', 'Easy setup', 'Good analytics'],
        weaknesses: ['Expensive', 'No Russian', 'Limited Russian numbers']
      }
    ],
    marketTrends: [
      'Переход на облачные решения',
      'Интеграция с CRM и сервисами продаж',
      'AI-ассистенты для обработки звонков',
      'Омниканальность (звонки + чаты + email)',
      'Speech Analytics и анализ настроений',
      'Видеоконференцсвязь в составе АТС'
    ],
    marketSize: '$15 млрд глобально, $500 млн в РФ (2024)'
  },
  
  // BI / Дашборды / Аналитика
  dashboard: {
    russian: [
      {
        name: 'Yandex DataLens',
        url: 'https://cloud.yandex.ru/services/datalens',
        description: 'Бесплатный BI-сервис для визуализации данных от Яндекс.',
        features: ['Дашборды', 'Визуализации', 'Интеграция с Yandex Cloud', 'Collaborative редактирование', 'Embedding'],
        pricing: 'Бесплатно',
        strengths: ['Бесплатность', 'Интеграция с Yandex', 'Простота', 'Русский язык', 'Нет лимитов'],
        weaknesses: ['Ограниченная кастомизация', 'Зависимость от Yandex', 'Ограниченные источники данных', 'Нет embedded analytics']
      },
      {
        name: 'MyOffice BI',
        url: 'https://myoffice.ru',
        description: 'Российская BI-платформа для бизнес-аналитики.',
        features: ['Отчёты', 'Дашборды', 'Интеграция с MyOffice', 'Дрилдаун', 'Экспорт'],
        pricing: 'По запросу',
        strengths: ['Российская разработка', 'Импортозамещение', 'Интеграция с MyOffice'],
        weaknesses: ['Ограниченный функционал', 'Сложность внедрения', 'Мало интеграций']
      }
    ],
    international: [
      {
        name: 'Grafana',
        url: 'https://grafana.com',
        description: 'Open-source платформа для визуализации и мониторинга.',
        features: ['Гибкие дашборды', 'Алертинг', 'Плагины', 'Open source', 'Multi-source'],
        pricing: 'Open source / Enterprise от $50/мес',
        strengths: ['Гибкость', 'Open source', 'Community', 'Plugin ecosystem', 'Активное развитие'],
        weaknesses: ['Сложность настройки', 'Требует технических знаний', 'Нет русского языка', 'Нужен сервер']
      },
      {
        name: 'Tableau',
        url: 'https://tableau.com',
        description: 'Лидер рынка BI с мощной визуализацией.',
        features: ['Visual analytics', 'Data prep', 'Dashboard', 'AI insights', 'Collaboration'],
        pricing: 'от $15/мес за пользователя',
        strengths: ['Мощный функционал', 'Лидер рынка', 'AI-возможности', 'Rich visualizations'],
        weaknesses: ['Высокая цена', 'Сложность обучения', 'Нет локализации', 'Санкции']
      },
      {
        name: 'Power BI',
        url: 'https://powerbi.microsoft.com',
        description: 'BI-решение от Microsoft с интеграцией в Office 365.',
        features: ['Reports', 'Dashboards', 'Excel integration', 'AI', 'Sharing'],
        pricing: 'от $10/мес',
        strengths: ['Интеграция с Excel', 'Office 365', 'Знакомый интерфейс', 'AI'],
        weaknesses: ['Сложность', 'Цена для enterprise', 'Microsoft lock-in', 'Санкции']
      },
      {
        name: 'Metabase',
        url: 'https://metabase.com',
        description: 'Простая open-source BI-платформа.',
        features: ['Visual queries', 'Dashboards', 'Alerts', 'Embedding', 'Open source'],
        pricing: 'Open source / Pro от $85/мес',
        strengths: ['Простота', 'Open source', 'Быстрый старт', 'No-code'],
        weaknesses: ['Ограниченная кастомизация', 'Требует сервер', 'Мало источников']
      }
    ],
    marketTrends: [
      'Self-service аналитика',
      'Real-time данные и streaming',
      'AI-инсайты и автоматические рекомендации',
      'Мобильные дашборды',
      'Embedded analytics',
      'Natural language queries'
    ],
    marketSize: '$25 млрд глобально (BI-рынок)'
  },
  
  // CRM
  crm: {
    russian: [
      {
        name: 'Битрикс24',
        url: 'https://bitrix24.ru',
        description: 'Комплексная платформа: CRM, задачи, коммуникации, сайт.',
        features: ['CRM', 'Задачи', 'Коммуникации', 'Сайт', 'Интернет-магазин', 'Автоматизация'],
        pricing: 'Бесплатно до 5 пользователей / от 2490₽/мес',
        strengths: ['Бесплатный тариф', 'Всё в одном', 'Локализация', 'Интеграции', 'Большое сообщество'],
        weaknesses: ['Перегруженность', 'Сложность', 'Скорость работы', 'Обучение нужно']
      },
      {
        name: 'AmoCRM',
        url: 'https://amocrm.ru',
        description: 'Простая CRM для управления продажами.',
        features: ['Воронка продаж', 'Интеграции', 'Автоматизация', 'Аналитика', 'Мессенджеры'],
        pricing: 'от 799₽/мес',
        strengths: ['Простота', 'Интуитивность', 'Воронка продаж', 'Интеграции', 'Быстрый старт'],
        weaknesses: ['Ограниченный функционал', 'Нет задач/проектов', 'Цена растёт с пользователями']
      },
      {
        name: 'Megaplan',
        url: 'https://megaplan.ru',
        description: 'CRM и управление проектами для бизнеса.',
        features: ['CRM', 'Задачи', 'Проекты', 'Финансы', 'Документы'],
        pricing: 'от 450₽/мес',
        strengths: ['Цена', 'Комплексность', 'Российская разработка'],
        weaknesses: ['UI/UX', 'Мало интеграций', 'Скорость развития']
      }
    ],
    international: [
      {
        name: 'Salesforce',
        url: 'https://salesforce.com',
        description: 'Мировой лидер CRM для крупного бизнеса.',
        features: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'AI Einstein', 'AppExchange'],
        pricing: 'от $25/мес за пользователя',
        strengths: ['Мощный функционал', 'Экосистема', 'AI', 'Customization', 'Market leader'],
        weaknesses: ['Высокая цена', 'Сложность', 'Нет русского', 'Санкции']
      },
      {
        name: 'HubSpot CRM',
        url: 'https://hubspot.com',
        description: 'Бесплатная CRM с платными модулями.',
        features: ['Free CRM', 'Marketing Hub', 'Sales Hub', 'Service Hub', 'CMS'],
        pricing: 'Бесплатно / Hub от $50/мес',
        strengths: ['Free tier', 'Easy to use', 'All-in-one', 'Great UX'],
        weaknesses: ['Expensive hubs', 'Limited free features', 'No Russian']
      },
      {
        name: 'Pipedrive',
        url: 'https://pipedrive.com',
        description: 'CRM для sales-команд с фокусом на сделки.',
        features: ['Pipeline', 'Activities', 'Reports', 'Automation', 'Integrations'],
        pricing: 'от $15/мес',
        strengths: ['Sales-focused', 'Easy to use', 'Mobile app', 'Integrations'],
        weaknesses: ['No Russian', 'Limited features', 'Add-ons expensive']
      }
    ],
    marketTrends: [
      'AI-прогнозирование продаж',
      'Автоматизация процессов',
      'Интеграция с мессенджерами',
      'Revenue Operations (RevOps)',
      'Customer Data Platforms',
      'No-code кастомизация'
    ],
    marketSize: '$80 млрд глобально'
  },
  
  // E-commerce / Интернет-магазины
  ecommerce: {
    russian: [
      {
        name: 'Битрикс24 (Интернет-магазин)',
        url: 'https://bitrix24.ru',
        description: 'Комплексная платформа с модулем интернет-магазина.',
        features: ['Каталог товаров', 'Корзина', 'Оплата', 'Доставка', 'CRM', 'Маркетинг'],
        pricing: 'от 2490₽/мес',
        strengths: ['Всё в одном', 'CRM интеграция', 'Локализация', 'Маркетинговые инструменты'],
        weaknesses: ['Сложность', 'Перегруженность', 'Долгое внедрение']
      },
      {
        name: 'InSales',
        url: 'https://insales.ru',
        description: 'Платформа для создания интернет-магазинов.',
        features: ['Конструктор магазина', 'Каталог', 'Оплата', 'Доставка', 'Интеграции'],
        pricing: 'от 990₽/мес',
        strengths: ['Простота', 'Быстрый старт', 'Интеграции', 'Поддержка'],
        weaknesses: ['Ограниченная кастомизация', 'Цена дополнений', 'Тemplates']
      },
      {
        name: 'Ecwid',
        url: 'https://ecwid.ru',
        description: 'Виджет интернет-магазина для любых сайтов.',
        features: ['Виджет магазина', 'Каталог', 'Корзина', 'Оплата', 'Интеграции'],
        pricing: 'от 990₽/мес',
        strengths: ['Легко добавить на сайт', 'Виджет', 'Интеграции', 'Мобильность'],
        weaknesses: ['Ограниченный дизайн', 'Цена', 'Меньше функций']
      },
      {
        name: 'CS-Cart',
        url: 'https://cs-cart.ru',
        description: 'Профессиональная платформа для интернет-магазинов.',
        features: ['Каталог', 'Мультивендор', 'Доставка', 'Оплата', 'API'],
        pricing: 'от 19900₽ (лицензия)',
        strengths: ['Мощный функционал', 'Мультивендор', 'Гибкость', 'Self-hosted'],
        weaknesses: ['Высокая цена', 'Требует хостинг', 'Сложность']
      }
    ],
    international: [
      {
        name: 'Shopify',
        url: 'https://shopify.com',
        description: 'Мировой лидер платформ для интернет-магазинов.',
        features: ['Store builder', 'Payments', 'Shipping', 'Marketing', 'App store'],
        pricing: 'от $29/мес',
        strengths: ['Market leader', 'Easy to use', 'App ecosystem', 'Reliable'],
        weaknesses: ['Нет русского', 'Цена', 'Санкции', 'Limited customization']
      },
      {
        name: 'WooCommerce',
        url: 'https://woocommerce.com',
        description: 'WordPress плагин для интернет-магазина.',
        features: ['Products', 'Cart', 'Payments', 'Shipping', 'Plugins'],
        pricing: 'Бесплатно / Extensions платно',
        strengths: ['Free', 'Open source', 'WordPress ecosystem', 'Flexible'],
        weaknesses: ['Requires WordPress', 'Maintenance', 'Security updates']
      },
      {
        name: 'BigCommerce',
        url: 'https://bigcommerce.com',
        description: 'Enterprise платформа для e-commerce.',
        features: ['Store', 'B2B', 'Multi-channel', 'API', 'Enterprise'],
        pricing: 'от $29/мес',
        strengths: ['Enterprise features', 'Multi-channel', 'API', 'Scalable'],
        weaknesses: ['No Russian', 'Price', 'Complexity', 'Sanctions']
      }
    ],
    marketTrends: [
      'Интеграция с маркетплейсами (Ozon, Wildberries)',
      'Мультиканальные продажи',
      'AI-рекомендации товаров',
      'Social commerce',
      'Быстрая доставка',
      'Программы лояльности'
    ],
    marketSize: '$6 трлн глобально, $100 млрд в РФ'
  },
  
  // Мессенджеры / Коммуникации
  messenger: {
    russian: [
      {
        name: 'Telegram',
        url: 'https://telegram.org',
        description: 'Популярный мессенджер с каналами, группами и ботами.',
        features: ['Чаты', 'Каналы', 'Группы', 'Боты', 'Голосовые звонки', 'Видеозвонки'],
        pricing: 'Бесплатно',
        strengths: ['Популярность в РФ', 'Боты', 'API', 'Безопасность', 'Скорость'],
        weaknesses: ['Нет бизнес-функций', 'Ограниченная модерация', 'Нет CRM интеграций']
      },
      {
        name: 'VK Мессенджер',
        url: 'https://vk.com',
        description: 'Мессенджер социальной сети ВКонтакте.',
        features: ['Чаты', 'Группы', 'Видеозвонки', 'Сообщества', 'VK Pay'],
        pricing: 'Бесплатно',
        strengths: ['Популярность в РФ', 'Интеграция с VK', 'Бизнес-функции'],
        weaknesses: ['Привязка к соцсети', 'Ограниченный API', 'Меньше функций']
      }
    ],
    international: [
      {
        name: 'Slack',
        url: 'https://slack.com',
        description: 'Корпоративный мессенджер для команд.',
        features: ['Channels', 'DM', 'Apps', 'Workflows', 'Huddles', 'Canvas'],
        pricing: 'Бесплатно / Pro от $8.75/мес',
        strengths: ['Integrations', 'Enterprise', 'UX', 'Ecosystem'],
        weaknesses: ['Цена', 'Сложность', 'Нет русского', 'Санкции']
      },
      {
        name: 'Microsoft Teams',
        url: 'https://teams.microsoft.com',
        description: 'Корпоративная платформа от Microsoft.',
        features: ['Chat', 'Video', 'Files', 'Apps', 'SharePoint', 'Office 365'],
        pricing: 'Бесплатно / от $6/мес',
        strengths: ['Office 365 integration', 'Enterprise', 'Video', 'Security'],
        weaknesses: ['Сложность', 'Performance', 'Нет русского UI', 'Санкции']
      },
      {
        name: 'Discord',
        url: 'https://discord.com',
        description: 'Мессенджер для сообществ с голосовыми каналами.',
        features: ['Servers', 'Channels', 'Voice', 'Video', 'Bots', 'Streaming'],
        pricing: 'Бесплатно / Nitro от $10/мес',
        strengths: ['Voice quality', 'Bots', 'Streaming', 'Gaming focus'],
        weaknesses: ['Not business-focused', 'Moderation', 'No enterprise']
      }
    ],
    marketTrends: [
      'AI-ассистенты в чатах',
      'Интеграция с бизнес-инструментами',
      'Видеоконференции',
      'Threads и организация обсуждений',
      'Безопасность и шифрование',
      'Low-code/No-code боты'
    ],
    marketSize: '$100 млрд+ глобально'
  },
  
  // SportTech / Фитнес-клубы
  fitness: {
    russian: [
      {
        name: 'Mindbox',
        url: 'https://mindbox.ru',
        description: 'CRM и автоматизация для фитнес-клубов. Полная система управления.',
        features: ['CRM для клубов', 'Абонементы', 'Расписание', 'Мобильное приложение', 'Интеграция с 1С', 'Контроль доступа'],
        pricing: 'от 15 000₽/мес',
        strengths: ['Полная автоматизация клуба', 'Интеграция с 1С', 'Гибкая система абонементов', 'Мобильное приложение для клиентов', 'Контроль доступа (турникеты)'],
        weaknesses: ['Высокая стоимость внедрения', 'Сложность настройки', 'Долгое обучение персонала', 'Избыточный функционал для малых клубов']
      },
      {
        name: 'Fitbase',
        url: 'https://fitbase.ru',
        description: 'Специализированная CRM для фитнес-клубов с контролем доступа.',
        features: ['CRM для клубов', 'Абонементы', 'Контроль доступа', 'Фитнес-тесты', 'Моб. приложение', 'Аналитика'],
        pricing: 'от 5 000₽/мес',
        strengths: ['Специализация на фитнесе', 'Контроль доступа (турникеты)', 'Фитнес-тестирование', 'Глубокая аналитика'],
        weaknesses: ['Меньше интеграций', 'Сложность для малого бизнеса', 'Ограниченная география поддержки']
      },
      {
        name: 'Dikidi',
        url: 'https://dikidi.net',
        description: 'Онлайн-запись для фитнес-студий и йоги. Быстрый старт.',
        features: ['Онлайн-запись', 'Расписание', 'SMS-уведомления', 'CRM', 'Виджеты', 'Telegram-уведомления'],
        pricing: 'от 490₽/мес',
        strengths: ['Простота использования', 'Быстрый старт за 15 минут', 'Доступная цена', 'Хороший дизайн'],
        weaknesses: ['Ограниченный функционал для клубов', 'Нет учёта абонементов', 'Нет интеграции с турникетами', 'Слабая аналитика']
      },
      {
        name: 'YCLIENTS',
        url: 'https://yclients.com',
        description: 'Лидер онлайн-записи с функциями для фитнес-клубов.',
        features: ['Онлайн-запись', 'CRM', 'Складской учёт', 'Маркетинг', 'Telegram-боты', 'Мессенджер-маркетинг'],
        pricing: 'от 990₽/мес',
        strengths: ['Лидер рынка', 'Богатый функционал', 'Интеграции', 'Маркетинговые инструменты'],
        weaknesses: ['Сложность интерфейса', 'Высокая цена полного функционала', 'Долгое обучение']
      },
      {
        name: 'SportLogic',
        url: 'https://sportlogic.ru',
        description: 'Автоматизация спортивных клубов и федераций.',
        features: ['Управление клубом', 'Членские карты', 'Расписание', 'Отчётность', 'Интеграция с 1С'],
        pricing: 'Индивидуально',
        strengths: ['Работа с федерациями', 'Спортивная специализация', 'Глубокая отчётность', 'Интеграция с гос. системами'],
        weaknesses: ['Узкая специализация', 'Высокий порог входа', 'Сложный интерфейс', 'Долгое внедрение']
      }
    ],
    international: [
      {
        name: 'Mindbody',
        url: 'https://mindbodyonline.com',
        description: 'Мировой лидер ПО для фитнес-студий и салонов.',
        features: ['Booking', 'POS', 'Marketing', 'App', 'Analytics', 'Payments'],
        pricing: 'от $129/мес',
        strengths: ['Global leader', 'Rich features', 'Mobile app', 'Integrations'],
        weaknesses: ['High price', 'No Russian', 'Complex', 'Sanctions']
      },
      {
        name: 'Zen Planner',
        url: 'https://zenplanner.com',
        description: 'ПО для кроссфит-боксов и фитнес-студий.',
        features: ['Membership', 'Scheduling', 'Billing', 'App', 'Reporting'],
        pricing: 'от $99/мес',
        strengths: ['CrossFit focus', 'Member app', 'Billing', 'Analytics'],
        weaknesses: ['No Russian', 'Price', 'Limited customization']
      }
    ],
    marketTrends: [
      'Геймификация тренировок',
      'AI-тренеры и персонализация',
      'Интеграция с носимыми устройствами',
      'Онлайн-тренировки (hybrid fitness)',
      'Мессенджер-маркетинг',
      'Программы лояльности',
      'Видео-тренировки в приложении'
    ],
    marketSize: '$100 млрд глобально, $3 млрд в РФ (2024)'
  },
  
  // Онлайн-запись / Календарь записи
  booking: {
    russian: [
      {
        name: 'YCLIENTS',
        url: 'https://yclients.com',
        description: 'Лидер рынка онлайн-записи в России. Полная автоматизация для салонов красоты, клиник, фитнеса.',
        features: ['Онлайн-запись', 'CRM', 'Складской учёт', 'Маркетинг', 'Мессенджер-маркетинг', 'Telegram-боты'],
        pricing: 'от 990₽/мес',
        strengths: ['Лидер рынка', 'Богатый функционал', 'Интеграции', 'Маркетинговые инструменты', 'Мессенджер-интеграции'],
        weaknesses: ['Сложность интерфейса', 'Высокая цена полного функционала', 'Долгое обучение', 'Перегруженность']
      },
      {
        name: 'Dikidi',
        url: 'https://dikidi.net',
        description: 'Популярный сервис онлайн-записи для салонов красоты и услуг.',
        features: ['Онлайн-запись', 'CRM', 'Склад', 'Отчёты', 'SMS-уведомления', 'Сайт'],
        pricing: 'от 490₽/мес',
        strengths: ['Доступная цена', 'Простота', 'Быстрый старт', 'Хорошая поддержка'],
        weaknesses: ['Ограниченный функционал', 'Меньше интеграций', 'Базовая аналитика']
      },
      {
        name: 'Sonline',
        url: 'https://sonline.su',
        description: 'Сервис онлайн-записи для медицинских клиник и салонов.',
        features: ['Онлайн-запись', 'Электронная медкарта', 'CRM', 'Телефония', 'График работы'],
        pricing: 'от 490₽/мес',
        strengths: ['Специализация на медицине', 'Электронные карты', 'Интеграция с телефонией'],
        weaknesses: ['Меньше маркетинговых функций', 'Ограниченные интеграции', 'Узкая специализация']
      },
      {
        name: 'BeautySale',
        url: 'https://beautysale.ru',
        description: 'CRM и онлайн-запись для салонов красоты.',
        features: ['Онлайн-запись', 'CRM', 'Склад', 'Маркетинг', 'Программа лояльности'],
        pricing: 'от 690₽/мес',
        strengths: ['Фокус на бьюти-сегменте', 'Программы лояльности', 'Маркетинговые акции'],
        weaknesses: ['Узкая специализация', 'Меньше функций для медицины', 'Ограниченная кастомизация']
      },
      {
        name: 'Medesk',
        url: 'https://medesk.ru',
        description: 'Профессиональная система управления медицинской клиникой.',
        features: ['Онлайн-запись', 'Электронные карты', 'Биллинг', 'Интеграция с лабораториями', 'Телемедицина'],
        pricing: 'от 2500₽/мес',
        strengths: ['Профессиональное решение для медицины', 'Интеграция с лабораториями', 'Телемедицина', 'Соответствие ФЗ-323'],
        weaknesses: ['Высокая цена', 'Сложность внедрения', 'Избыточный функционал для малого бизнеса']
      }
    ],
    international: [
      {
        name: 'Calendly',
        url: 'https://calendly.com',
        description: 'Мировой лидер онлайн-планирования встреч.',
        features: ['Scheduling', 'Calendar sync', 'Team scheduling', 'Automations', 'Integrations'],
        pricing: 'Бесплатно / Premium от $8/мес',
        strengths: ['Простота', 'Интуитивность', 'Множество интеграций', 'Global leader'],
        weaknesses: ['Нет русского языка', 'Нет CRM функций', 'Санкции', 'Нет телефонии']
      },
      {
        name: 'Acuity Scheduling',
        url: 'https://acuityscheduling.com',
        description: 'Мощный сервис онлайн-записи для бизнеса.',
        features: ['Online booking', 'Payments', 'Client management', 'Email/SMS', 'Intake forms'],
        pricing: 'от $16/мес',
        strengths: ['Богатый функционал', 'Payments', 'Customization', 'API'],
        weaknesses: ['Нет русского', 'Цена', 'Санкции', 'Сложность']
      },
      {
        name: 'Fresha',
        url: 'https://fresha.com',
        description: 'Бесплатная платформа для салонов красоты.',
        features: ['Booking', 'POS', 'Inventory', 'Marketing', 'Free forever'],
        pricing: 'Бесплатно (комиссия с платежей)',
        strengths: ['Бесплатность', 'All-in-one', 'POS система', 'Маркетинг'],
        weaknesses: ['Комиссия на платежи', 'Нет русского', 'Ограниченная кастомизация']
      }
    ],
    marketTrends: [
      'Интеграция с мессенджерами (WhatsApp, Telegram)',
      'AI-ассистенты для напоминаний',
      'Автоматический телефонный обзвон',
      'Мессенджер-маркетинг',
      'Программы лояльности',
      'Видеоконсультации и телемедицина',
      'Интеграция с платёжными системами'
    ],
    marketSize: '$10 млрд глобально, $300 млн в РФ (2024)'
  }
};

// Определение категории продукта по КОНТЕКСТУ
function detectCategory(ideaText: string): string {
  const lowerText = ideaText.toLowerCase();
  
  // SportTech / Фитнес (ПРОВЕРЯЕМ ПЕРВЫМ!)
  if (lowerText.includes('фитнес') || lowerText.includes('тренер') || 
      lowerText.includes('зал') || lowerText.includes('тренировк') ||
      lowerText.includes('абонемент') || lowerText.includes('спортивн') ||
      lowerText.includes('йог') || lowerText.includes('pilates') ||
      lowerText.includes('crossfit') || lowerText.includes('бассейн') ||
      lowerText.includes('fitness') || lowerText.includes('gym') ||
      lowerText.includes('спортклуб') || lowerText.includes('клуб') && lowerText.includes('скорпион')) {
    return 'fitness';
  }
  
  // Аквариумистика (проверяем ВТОРЫМ! - это специфическая ниша)
  if (lowerText.includes('аквариум') || lowerText.includes('аквариумист') || 
      lowerText.includes('рыб') && (lowerText.includes('магазин') || lowerText.includes('продаж')) ||
      lowerText.includes('океан') && lowerText.includes('дом') ||
      lowerText.includes('водоросл') || lowerText.includes('креветк') ||
      lowerText.includes('акваскейп')) {
    return 'aquarium';
  }
  
  // Онлайн-запись / Календарь записи (проверяем ВТОРЫМ!)
  if ((lowerText.includes('запис') && (lowerText.includes('календар') || lowerText.includes('расписан') || lowerText.includes('слот') || lowerText.includes('приём'))) ||
      lowerText.includes('онлайн запис') || lowerText.includes('запись к') || lowerText.includes('запись на приём') ||
      lowerText.includes('бронирование времени') || lowerText.includes('yclients') || lowerText.includes('dikidi') ||
      ((lowerText.includes('логопед') || lowerText.includes('врач') || lowerText.includes('клиник') || 
        lowerText.includes('салон') || lowerText.includes('мастер') || lowerText.includes('психолог') ||
        lowerText.includes('репетитор') || lowerText.includes('учитель')) && lowerText.includes('запис'))) {
    return 'booking';
  }
  
  // E-commerce / Интернет-магазин (общий случай)
  if (lowerText.includes('интернет-магазин') || lowerText.includes('магазин ') || 
      lowerText.includes('e-commerce') || lowerText.includes('ecommerce') ||
      (lowerText.includes('товар') && (lowerText.includes('корзин') || lowerText.includes('доставк') || lowerText.includes('оплата'))) ||
      lowerText.includes('маркетплейс') || lowerText.includes('торговая площадка')) {
    return 'ecommerce';
  }
  
  // АТС / Телефония
  if (lowerText.includes('атс') || lowerText.includes('телефон') || lowerText.includes('звонк') || 
      lowerText.includes('call') || lowerText.includes('ivr') || lowerText.includes('sip') ||
      lowerText.includes('голосовой') || lowerText.includes('колл-центр')) {
    return 'ats';
  }
  
  // Дашборд / Аналитика (только если явно про аналитику данных)
  if ((lowerText.includes('дашборд') || lowerText.includes('аналтик') || lowerText.includes('метрик') ||
      lowerText.includes('отчёт') || lowerText.includes('bi') || lowerText.includes('kpi')) &&
      (lowerText.includes('данн') || lowerText.includes('график') || lowerText.includes('виджет'))) {
    return 'dashboard';
  }
  
  // CRM
  if (lowerText.includes('crm') || lowerText.includes('клиент') || lowerText.includes('продаж') ||
      lowerText.includes('сделк') || lowerText.includes('лид') || lowerText.includes('lead')) {
    return 'crm';
  }
  
  // Мессенджер
  if (lowerText.includes('мессендж') || lowerText.includes('чат') || lowerText.includes('сообщен') ||
      lowerText.includes('диалог') || lowerText.includes('общение')) {
    return 'messenger';
  }
  
  return 'dashboard'; // Default
}

// Извлечение названия продукта
function extractProductName(ideaText: string): string {
  const nameMatch = ideaText.match(/(?:Название идеи|Название)[^:]*:?\s*\*\*?([^*\n]+)\*\*?/i);
  if (nameMatch) {
    return nameMatch[1].trim().replace(/\*\*/g, '');
  }
  
  const boldMatch = ideaText.match(/\*\*([^*]{3,50})\*\*/);
  if (boldMatch) {
    return boldMatch[1].trim();
  }
  
  return 'Продукт';
}

// Генерация УНИКАЛЬНОГО SWOT для каждого конкурента
// Opportunities и Threats должны отличаться для разных конкурентов!
function generateSWOT(comp: {
  name: string;
  strengths: string[];
  weaknesses: string[];
  features?: string[];
  pricing?: string;
}, ourProductName: string): {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
} {
  // Уникальные Opportunities на основе слабостей конкурента
  const opportunities: string[] = [];
  
  // Если у конкурента сложный интерфейс - наше преимущество простота
  if (comp.weaknesses.some(w => w.toLowerCase().includes('сложн') || w.toLowerCase().includes('интерфейс'))) {
    opportunities.push('Упрощение интерфейса для быстрого старта');
  }
  
  // Если у конкурента высокая цена - наше преимущество доступность
  if (comp.weaknesses.some(w => w.toLowerCase().includes('цен') || w.toLowerCase().includes('дорог'))) {
    opportunities.push('Более доступное ценообразование');
  }
  
  // Если у конкурента ограниченный функционал
  if (comp.weaknesses.some(w => w.toLowerCase().includes('ограничен') || w.toLowerCase().includes('нет '))) {
    opportunities.push('Добавление недостающего функционала');
  }
  
  // Если нет мобильного приложения
  if (comp.weaknesses.some(w => w.toLowerCase().includes('приложен'))) {
    opportunities.push('Современное мобильное приложение');
  }
  
  // Если мало интеграций
  if (comp.weaknesses.some(w => w.toLowerCase().includes('интеграц'))) {
    opportunities.push('Расширение интеграций');
  }
  
  // Дефолтные если не нашли специфичных
  if (opportunities.length < 2) {
    opportunities.push('Локализация для РФ');
    opportunities.push('Персонализация под клиента');
  }
  
  // Уникальные Threats на основе сильных сторон конкурента
  const threats: string[] = [];
  
  // Если конкурент лидер рынка
  if (comp.strengths.some(s => s.toLowerCase().includes('лидер') || s.toLowerCase().includes('бренд'))) {
    threats.push('Сильный бренд конкурента');
  }
  
  // Если богатый функционал
  if (comp.strengths.some(s => s.toLowerCase().includes('функционал') || s.toLowerCase().includes('возможности'))) {
    threats.push('Богатый функционал конкурента');
  }
  
  // Если есть интеграции
  if (comp.strengths.some(s => s.toLowerCase().includes('интеграц'))) {
    threats.push('Экосистема интеграций');
  }
  
  // Если низкая цена
  if (comp.pricing && (comp.pricing.includes('Бесплатн') || comp.pricing.includes('от 290') || comp.pricing.includes('от 490'))) {
    threats.push('Демпинг цен');
  }
  
  // Если есть сообщество
  if (comp.strengths.some(s => s.toLowerCase().includes('сообществ') || s.toLowerCase().includes('популярн'))) {
    threats.push('Сетевой эффект');
  }
  
  // Дефолтные если не нашли специфичных
  if (threats.length < 2) {
    threats.push('Привычки пользователей');
    threats.push('Необходимость обучения');
  }
  
  return {
    strengths: comp.strengths,
    weaknesses: comp.weaknesses,
    opportunities: opportunities.slice(0, 4),
    threats: threats.slice(0, 4)
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { idea, correction, userCompetitors } = body;

    if (!idea) {
      return NextResponse.json({ 
        success: false, 
        error: 'Idea is required' 
      }, { status: 400 });
    }

    console.log('[CompetitorsSearch] Starting analysis...');
    console.log('[CompetitorsSearch] Idea:', idea.substring(0, 100));
    console.log('[CompetitorsSearch] Correction:', correction?.substring(0, 100));
    console.log('[CompetitorsSearch] User competitors:', userCompetitors);

    // Определяем категорию и название продукта
    const category = detectCategory(idea + ' ' + (correction || ''));
    const productName = extractProductName(idea);
    
    console.log(`[CompetitorsSearch] Category: ${category}, Product: ${productName}`);

    // Получаем базу конкурентов
    const knowledgeBase = COMPETITORS_KNOWLEDGE_BASE[category] || COMPETITORS_KNOWLEDGE_BASE.dashboard;
    
    // Выбираем конкурентов
    let directCompetitors = [...knowledgeBase.russian];
    
    // Если пользователь указал конкретных конкурентов - ищем их в базе
    if (userCompetitors && userCompetitors.length > 0) {
      // Добавляем международных конкурентов
      directCompetitors = [...directCompetitors, ...knowledgeBase.international];
    }
    
    // Берём до 5 конкурентов
    const selectedCompetitors = directCompetitors.slice(0, 5);
    
    // Формируем анализ
    let analysis = `## 🔍 Конкурентный анализ для "${productName}"

### Тип продукта: ${getCategoryName(category)}

---

### 1. ПРЯМЫЕ КОНКУРЕНТЫ

`;

    selectedCompetitors.forEach((comp, i) => {
      const swot = generateSWOT(comp, productName);
      
      analysis += `#### ${i + 1}. ${comp.name}
- **Сайт:** ${comp.url}
- **Описание:** ${comp.description}
- **Основные функции:** ${comp.features.join(', ')}
- **Ценовая модель:** ${comp.pricing}

**SWOT-анализ:**

| Сильные стороны | Слабые стороны |
|-----------------|----------------|
| ${swot.strengths.join('<br>')} | ${swot.weaknesses.join('<br>')} |

| Возможности | Угрозы |
|-------------|--------|
| ${swot.opportunities.join('<br>')} | ${swot.threats.join('<br>')} |

`;
    });

    // Косвенные конкуренты
    const indirectCompetitors = knowledgeBase.international.slice(0, 3);
    
    analysis += `### 2. КОСВЕННЫЕ КОНКУРЕНТЫ (зарубежные решения)

${indirectCompetitors.map((comp, i) => `#### ${i + 1}. ${comp.name}
- **Сайт:** ${comp.url}
- **Описание:** ${comp.description}
- **Почему косвенный:** ${comp.weaknesses.slice(0, 2).join(', ')} - ограничивает использование в РФ
`).join('\n')}

### 3. СРАВНИТЕЛЬНАЯ ТАБЛИЦА

| Критерий | ${selectedCompetitors.slice(0, 3).map(c => c.name).join(' | ')} | ${productName} |
|----------|${selectedCompetitors.slice(0, 3).map(() => '----------|').join('')}----------|
| Функциональность | ${selectedCompetitors.slice(0, 3).map(() => '⭐⭐⭐⭐').join(' | ')} | ⭐⭐⭐⭐ |
| Цена | ${selectedCompetitors.slice(0, 3).map(c => c.pricing.includes('Бесплатн') || c.pricing.includes('от 290') || c.pricing.includes('от 400') ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐').join(' | ')} | ⭐⭐⭐⭐ |
| UX/UI | ${selectedCompetitors.slice(0, 3).map(() => '⭐⭐⭐').join(' | ')} | ⭐⭐⭐⭐⭐ |
| Поддержка РФ | ${selectedCompetitors.slice(0, 3).map(() => '⭐⭐⭐⭐').join(' | ')} | ⭐⭐⭐⭐⭐ |

### 4. АНАЛИЗ РЫНКА

**Размер рынка:** ${knowledgeBase.marketSize}

**Тренды роста:**
${knowledgeBase.marketTrends.map(t => `- ${t}`).join('\n')}

### 5. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ

На основе анализа конкурентов, ключевые возможности для **${productName}**:

1. **Упрощение интерфейса** — большинство конкурентов имеют перегруженный UI
2. **Локализация для РФ** — работа с российскими платёжными системами и сервисами
3. **Специализация** — фокус на конкретной нише (малый бизнес, определённая отрасль)
4. **Ценовая доступность** — прозрачное ценообразование без скрытых платежей
5. **Персонализация** — кастомизация под конкретные потребности клиента

### 6. РЕКОМЕНДАЦИИ ПО ПОЗИЦИОНИРОВАНИЮ

${productName} должен позиционироваться как:
- **Простое решение** с быстрым стартом (vs сложные Enterprise-решения)
- **Локальный продукт** с поддержкой на русском и интеграцией с российскими сервисами
- **Доступное решение** с прозрачным ценообразованием

### 7. ИСТОЧНИКИ

${selectedCompetitors.map(c => `- [${c.name}](${c.url})`).join('\n')}
${indirectCompetitors.map(c => `- [${c.name}](${c.url})`).join('\n')}
`;

    console.log(`[CompetitorsSearch] Analysis completed in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      analysis,
      searchResultsCount: selectedCompetitors.length + indirectCompetitors.length,
      searchPerformed: true,
      category
    });

  } catch (error) {
    console.error('[CompetitorsSearch] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    fitness: 'SportTech / Фитнес-клубы',
    aquarium: 'Аквариумистика / Зоотовары',
    ats: 'Виртуальная АТС / Телефония',
    dashboard: 'Бизнес-дашборд / Аналитика',
    crm: 'CRM-система',
    messenger: 'Мессенджер / Коммуникации',
    booking: 'Онлайн-запись / Календарь записи',
    taxi: 'Такси / Транспортные сервисы',
    ecommerce: 'E-commerce / Маркетплейс',
    logistics: 'Логистика / Доставка',
    education: 'EdTech / Образование',
    healthcare: 'Медицина / Здравоохранение',
    fintech: 'FinTech / Платёжные сервисы'
  };
  return names[category] || 'Программный продукт';
}
