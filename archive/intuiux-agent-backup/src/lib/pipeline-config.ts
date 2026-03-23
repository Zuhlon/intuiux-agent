/**
 * Pipeline Configuration
 * Defines stages dynamically based on product context
 */

export type ProductType = 
  | 'ecommerce' 
  | 'saas' 
  | 'b2b' 
  | 'blog' 
  | 'landing' 
  | 'dashboard' 
  | 'booking' 
  | 'app';

export interface StageConfig {
  name: string;       // Machine name
  label: string;      // Human-readable label
  description: string;
  isOptional: boolean;
  dependencies: number[];  // Stage numbers this depends on
  generateMermaid?: boolean;  // Whether this stage generates Mermaid diagram
  icon?: string;       // Icon name for UI
  color?: string;      // Gradient color for UI
}

// Stage definitions with UI properties
const STAGE_DEFS: Record<string, Omit<StageConfig, 'dependencies' | 'isOptional'>> = {
  idea: {
    name: 'idea',
    label: 'Идея',
    description: 'Анализ и структурирование идеи продукта',
    icon: 'Lightbulb',
    color: 'from-amber-400 to-yellow-500'
  },
  competitors: {
    name: 'competitors',
    label: 'Конкуренты',
    description: 'Анализ конкурентов и рынка',
    icon: 'BarChart3',
    color: 'from-orange-400 to-red-500'
  },
  cjm: {
    name: 'cjm',
    label: 'CJM',
    description: 'Карта пути пользователя',
    generateMermaid: true,
    icon: 'TrendingUp',
    color: 'from-emerald-400 to-teal-500'
  },
  ia: {
    name: 'ia',
    label: 'IA',
    description: 'Информационная архитектура',
    generateMermaid: true,
    icon: 'Network',
    color: 'from-cyan-400 to-blue-500'
  },
  userflow: {
    name: 'userflow',
    label: 'Userflow',
    description: 'Пользовательские сценарии',
    generateMermaid: true,
    icon: 'Users',
    color: 'from-blue-400 to-indigo-500'
  },
  prototype: {
    name: 'prototype',
    label: 'Прототип',
    description: 'Интерактивный HTML прототип',
    icon: 'Github',
    color: 'from-violet-400 to-purple-500'
  },
  invitation: {
    name: 'invitation',
    label: 'Приглашение',
    description: 'Скрипт приглашения на тестирование',
    isOptional: true,
    icon: 'Mail',
    color: 'from-pink-400 to-rose-500'
  },
  guideline: {
    name: 'guideline',
    label: 'Гайдлайн',
    description: 'Руководство по тестированию',
    isOptional: true,
    icon: 'ClipboardList',
    color: 'from-rose-400 to-pink-500'
  },
  metrics: {
    name: 'metrics',
    label: 'Метрики',
    description: 'Продуктовые метрики',
    isOptional: true,
    icon: 'BarChart',
    color: 'from-teal-400 to-emerald-500'
  }
};

// Build stages with dependencies
function buildStage(name: string, deps: number[], isOptional: boolean = false): StageConfig {
  const def = STAGE_DEFS[name];
  return {
    ...def,
    dependencies: deps,
    isOptional
  };
}

// Context-based stage configurations
// Each product type has different optimal stages
const PRODUCT_STAGES: Record<ProductType, StageConfig[]> = {
  ecommerce: [
    buildStage('idea', []),
    buildStage('competitors', [1]),
    buildStage('cjm', [1, 2]),
    buildStage('ia', [3], false),  // IA after CJM - structure catalog, categories
    buildStage('userflow', [4], false),  // Catalog, cart, checkout flows
    buildStage('prototype', [5]),
    buildStage('invitation', [6], true),
    buildStage('guideline', [6], true),
    buildStage('metrics', [6], true)
  ],

  saas: [
    buildStage('idea', []),
    buildStage('competitors', [1]),
    buildStage('cjm', [1, 2]),
    buildStage('ia', [3], false),  // App structure, navigation
    buildStage('userflow', [4], false),  // Onboarding, activation flows
    buildStage('prototype', [5]),
    buildStage('invitation', [6], true),
    buildStage('guideline', [6], true),
    buildStage('metrics', [6], true)
  ],

  b2b: [
    buildStage('idea', []),
    buildStage('competitors', [1]),
    buildStage('cjm', [1, 2]),
    buildStage('ia', [3], false),  // Platform structure
    buildStage('userflow', [4], false),  // B2B workflows
    buildStage('prototype', [5]),
    buildStage('invitation', [6], true),
    buildStage('guideline', [6], true),
    buildStage('metrics', [6], true)
  ],

  blog: [
    buildStage('idea', []),
    buildStage('competitors', [1]),
    buildStage('cjm', [1, 2]),  // CJM for media/blog readers
    buildStage('ia', [3], false),  // Content structure: categories, tags
    buildStage('userflow', [4], false),  // Reading, subscription flows
    buildStage('prototype', [5]),
    buildStage('metrics', [6], true)
  ],

  landing: [
    buildStage('idea', []),
    buildStage('competitors', [1]),
    buildStage('cjm', [1, 2]),  // CJM for landing page visitors
    buildStage('ia', [3], false),  // Page structure, sections
    buildStage('prototype', [4]),
    buildStage('metrics', [5], true)
  ],

  dashboard: [
    buildStage('idea', []),
    buildStage('competitors', [1]),
    buildStage('cjm', [1, 2]),  // CJM for dashboard users
    buildStage('ia', [3], false),  // Widget structure, filters
    buildStage('userflow', [4], false),  // Data interaction flows
    buildStage('prototype', [5]),
    buildStage('metrics', [6], true)
  ],

  booking: [
    buildStage('idea', []),
    buildStage('competitors', [1]),
    buildStage('cjm', [1, 2]),  // Booking journey
    buildStage('ia', [3], false),  // Services, schedule, masters
    buildStage('userflow', [4], false),  // Booking flow
    buildStage('prototype', [5]),
    buildStage('invitation', [6], true),
    buildStage('guideline', [6], true),
    buildStage('metrics', [6], true)
  ],

  app: [
    buildStage('idea', []),
    buildStage('competitors', [1]),
    buildStage('cjm', [1, 2]),  // Mobile user journey
    buildStage('ia', [3], false),  // Screen structure, navigation
    buildStage('userflow', [4], false),  // Key mobile scenarios
    buildStage('prototype', [5]),
    buildStage('invitation', [6], true),
    buildStage('guideline', [6], true),
    buildStage('metrics', [6], true)
  ]
};

/**
 * Detect product type from idea text using context analysis
 */
export function detectProductType(text: string): ProductType {
  const lowerText = text.toLowerCase();
  
  // Scoring system for better detection
  const scores: Record<ProductType, number> = {
    ecommerce: 0,
    saas: 0,
    b2b: 0,
    blog: 0,
    landing: 0,
    dashboard: 0,
    booking: 0,
    app: 0
  };
  
  // E-commerce indicators
  if (/магазин|товар|каталог|корзин[аы]/i.test(text)) scores.ecommerce += 3;
  if (/заказ|доставк|оплата|покупк/i.test(text)) scores.ecommerce += 2;
  if (/цен[аы]|скидк|карточк.*товар|прайс/i.test(text)) scores.ecommerce += 2;
  if (/витрин|склад|остатк|интернет-магазин/i.test(text)) scores.ecommerce += 3;
  
  // Booking indicators
  if (/запис[ьы]|бронир|расписан/i.test(text)) scores.booking += 3;
  if (/слот|время|календар|записаться/i.test(text)) scores.booking += 2;
  if (/мастер|услуг|салон|клиник|студия/i.test(text)) scores.booking += 2;
  if (/напоминан|уведомлен.*запись/i.test(text)) scores.booking += 2;
  
  // SaaS indicators
  if (/saas|подписк|тариф/i.test(text)) scores.saas += 3;
  if (/freemium|команд|collaborat/i.test(text)) scores.saas += 2;
  if (/проект|задач|таск|доска|kanban/i.test(text)) scores.saas += 2;
  if (/интеграц|api.*ключ|webhook/i.test(text)) scores.saas += 2;
  
  // B2B indicators
  if (/b2b|корпоративн|предприяти/i.test(text)) scores.b2b += 3;
  if (/enterprise|crm|erp/i.test(text)) scores.b2b += 2;
  if (/логистик|оптов|партнер|дилер/i.test(text)) scores.b2b += 2;
  if (/менеджер.*продаж|лид|сделк/i.test(text)) scores.b2b += 2;
  
  // Blog/Media indicators
  if (/блог|стать|пост|новост/i.test(text)) scores.blog += 3;
  if (/медиа|контент|автор|подписчик/i.test(text)) scores.blog += 2;
  if (/комментари|рубрик|тег/i.test(text)) scores.blog += 1;
  if (/читател|редактор|журнал/i.test(text)) scores.blog += 2;
  
  // Dashboard indicators
  if (/дашборд|dashboard|аналитик/i.test(text)) scores.dashboard += 3;
  if (/метрик|график|отчет|статистик/i.test(text)) scores.dashboard += 2;
  if (/kpi|мониторинг|визуализац/i.test(text)) scores.dashboard += 2;
  if (/виджет|панел|данные/i.test(text)) scores.dashboard += 1;
  
  // Mobile App indicators
  if (/приложен|мобильн/i.test(text)) scores.app += 3;
  if (/ios|android|app store|google play/i.test(text)) scores.app += 3;
  if (/пуш|уведомлен.*телефон|смартфон/i.test(text)) scores.app += 2;
  if (/экран|swipe|touch/i.test(text)) scores.app += 1;
  
  // Landing indicators
  if (/лендинг|landing|одностранич/i.test(text)) scores.landing += 3;
  if (/курс|вебинар|мероприяти/i.test(text)) scores.landing += 2;
  if (/регистрац.*форма|cta|заявк/i.test(text)) scores.landing += 2;
  if (/продающ|страниц.*продукт/i.test(text)) scores.landing += 2;
  
  // Find the highest score
  let maxScore = 0;
  let detectedType: ProductType = 'landing';
  
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type as ProductType;
    }
  }
  
  // If no clear winner, default to landing
  if (maxScore === 0) {
    return 'landing';
  }
  
  return detectedType;
}

/**
 * Get stages for product type
 */
export function getStagesForProductType(productType: ProductType): StageConfig[] {
  return PRODUCT_STAGES[productType] || PRODUCT_STAGES.landing;
}

/**
 * Get all product types
 */
export function getAllProductTypes(): { value: ProductType; label: string }[] {
  return [
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'saas', label: 'SaaS' },
    { value: 'b2b', label: 'B2B' },
    { value: 'blog', label: 'Блог / Медиа' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'booking', label: 'Онлайн-запись' },
    { value: 'app', label: 'Мобильное приложение' }
  ];
}

/**
 * Get product type label
 */
export function getProductTypeLabel(productType: ProductType): string {
  const labels: Record<ProductType, string> = {
    ecommerce: 'E-commerce',
    saas: 'SaaS',
    b2b: 'B2B',
    blog: 'Блог / Медиа',
    landing: 'Landing Page',
    dashboard: 'Dashboard',
    booking: 'Онлайн-запись',
    app: 'Мобильное приложение'
  };
  return labels[productType] || productType;
}

/**
 * Get stage definition by name
 */
export function getStageDef(name: string): StageConfig | undefined {
  const def = STAGE_DEFS[name];
  if (!def) return undefined;
  return {
    ...def,
    dependencies: [],
    isOptional: false
  };
}
