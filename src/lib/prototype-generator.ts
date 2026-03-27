/**
 * Contextual Prototype Generator
 * Генерирует прототипы на основе контекста Идеи, IA и Userflow
 * Без шаблонов - только контекстная генерация
 * Version: 2.0 - Product-aware generation
 */

// === ТИПЫ ===

interface Idea {
  name: string;
  description: string;
  functions: string[];
}

interface IAContext {
  sections: string[];
  entities: string[];
  navigation: string[];
}

interface UserflowContext {
  screens: string[];
  actions: string[];
  flows: string[];
}

interface ProductType {
  type: 'ecommerce' | 'landing' | 'saas' | 'b2b' | 'blog' | 'dashboard' | 'booking' | 'content' | 'app';
  category: string;
  layout: 'mobile' | 'desktop' | 'responsive';
  primaryAction: string;
  secondaryActions: string[];
}

interface PrototypeContext {
  productName: string;
  idea: Idea;
  iaContext: IAContext;
  userflowContext: UserflowContext;
  productType: ProductType;
  fullContext: string;
}

// === ОПРЕДЕЛЕНИЕ ТИПА ПРОДУКТА ===

export function detectProductType(
  lowerContext: string, 
  functions: string[], 
  description: string
): ProductType {
  const ctx = lowerContext.toLowerCase();
  const funcs = functions.join(' ').toLowerCase();
  const desc = description.toLowerCase();
  const all = ctx + ' ' + funcs + ' ' + desc;

  // E-commerce / Интернет-магазин
  if (
    all.includes('магазин') || all.includes('ecommerce') || all.includes('e-commerce') ||
    all.includes('товар') || all.includes('каталог') || all.includes('корзин') ||
    all.includes('заказ') || all.includes('оплата') || all.includes('доставк') ||
    all.includes('аквариум') || all.includes('рыб') || all.includes('океан')
  ) {
    return {
      type: 'ecommerce',
      category: 'Интернет-магазин',
      layout: 'responsive',
      primaryAction: 'Купить',
      secondaryActions: ['Каталог', 'Корзина', 'Избранное']
    };
  }

  // Landing page
  if (
    all.includes('лендинг') || all.includes('landing') ||
    all.includes('одностраничн') || functions.length <= 2 ||
    (all.includes('подписк') && !all.includes('saas'))
  ) {
    return {
      type: 'landing',
      category: 'Лендинг',
      layout: 'responsive',
      primaryAction: 'Подписаться',
      secondaryActions: ['Узнать больше', 'Связаться']
    };
  }

  // SaaS продукт
  if (
    all.includes('saas') || all.includes('подписк') || all.includes('тариф') ||
    all.includes('планировщ') || all.includes('управлен') || all.includes('dashboard') ||
    all.includes('аналитик') || all.includes('отчёт')
  ) {
    return {
      type: 'saas',
      category: 'SaaS-продукт',
      layout: 'desktop',
      primaryAction: 'Попробовать',
      secondaryActions: ['Тарифы', 'Демо', 'Функции']
    };
  }

  // B2B продукт
  if (
    all.includes('b2b') || all.includes('бизнес') || all.includes('корпоративн') ||
    all.includes('crm') || all.includes('erp') || all.includes('интеграц')
  ) {
    return {
      type: 'b2b',
      category: 'B2B-продукт',
      layout: 'desktop',
      primaryAction: 'Запросить демо',
      secondaryActions: ['Контакты', 'Возможности']
    };
  }

  // Блог / Контент
  if (
    all.includes('блог') || all.includes('стать') || all.includes('пост') ||
    all.includes('контент') || all.includes('новост') || all.includes('медиа')
  ) {
    return {
      type: 'blog',
      category: 'Блог / Медиа',
      layout: 'responsive',
      primaryAction: 'Читать',
      secondaryActions: ['Категории', 'Подписка']
    };
  }

  // Dashboard
  if (
    all.includes('дашборд') || all.includes('dashboard') || all.includes('метрик') ||
    all.includes('статистик') || all.includes('мониторинг') || all.includes('аналитик')
  ) {
    return {
      type: 'dashboard',
      category: 'Дашборд',
      layout: 'desktop',
      primaryAction: 'Открыть',
      secondaryActions: ['Настройки', 'Экспорт']
    };
  }

  // Бронирование / Запись
  if (
    all.includes('запис') || all.includes('брон') || all.includes('слот') ||
    all.includes('календар') || all.includes('расписание')
  ) {
    return {
      type: 'booking',
      category: 'Онлайн-запись',
      layout: 'mobile',
      primaryAction: 'Записаться',
      secondaryActions: ['Расписание', 'Мои записи']
    };
  }

  // Default - приложение
  return {
    type: 'app',
    category: 'Приложение',
    layout: 'mobile',
    primaryAction: 'Начать',
    secondaryActions: ['Функции', 'Профиль']
  };
}

// === ГЕНЕРАЦИЯ ИКОНОК ===

function getIcon(text: string): string {
  const lower = text.toLowerCase();
  const iconMap: Record<string, string> = {
    'каталог': '📦', 'товар': '📦', 'продукт': '📦', 'аквариум': '🐠', 'рыб': '🐠',
    'заказ': '🛒', 'корзин': '🛒', 'покупк': '🛒', 'купить': '🛒',
    'запис': '📅', 'брон': '📅', 'слот': '📅', 'календар': '📅',
    'чат': '💬', 'сообщен': '💬', 'мессендж': '💬',
    'профил': '👤', 'аккаунт': '👤', 'пользовател': '👤',
    'поиск': '🔍', 'фильтр': '🔍', 'найти': '🔍',
    'аналитик': '📊', 'статистик': '📊', 'отчёт': '📊', 'метрик': '📊',
    'уведом': '🔔', 'оповещ': '🔔',
    'оплата': '💳', 'платёж': '💳', 'карт': '💳',
    'доставк': '🚚', 'логистик': '🚚',
    'блог': '📝', 'стать': '📝', 'пост': '📝',
    'настройк': '⚙️', 'конфигурац': '⚙️',
    'домой': '🏠', 'главн': '🏠',
    'избранн': '⭐', 'лайк': '⭐', 'звезд': '⭐',
    'подпис': '📧', 'newsletter': '📧',
    'контакт': '📞', 'телефон': '📞', 'звонок': '📞',
    'видео': '🎬', 'медиа': '🎬',
    'фото': '📷', 'изображен': '📷', 'галере': '📷',
    'помощ': '❓', 'faq': '❓', 'вопрос': '❓',
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return icon;
  }
  return '✨';
}

// === ГЕНЕРАЦИЯ CSS ===

function generateCSS(productType: ProductType): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #000; color: #fff; min-height: 100vh; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.3); } 50% { box-shadow: 0 0 40px rgba(250, 204, 21, 0.6); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    
    :root {
      --bg: #000; --bg-card: #0A0A0A; --bg-elevated: #141414;
      --border: #1A1A1A; --text: #FFF; --text-secondary: #A3A3A3;
      --accent: #FACC15; --success: #22C55E; --error: #EF4444;
    }
    
    .fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-glow { animation: glow 2s ease-in-out infinite; }
    .gradient-text { background: linear-gradient(90deg, #FACC15, #FEF08A, #FACC15); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
    
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
    .btn-primary { background: var(--accent); color: #000; }
    .btn-primary:hover { transform: scale(1.02); }
    .btn-secondary { background: transparent; color: var(--text); border: 1px solid var(--border); }
    .btn-secondary:hover { border-color: var(--accent); }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all 0.3s; }
    .card:hover { border-color: var(--accent); transform: translateY(-2px); }
    
    /* Header */
    .header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 16px 0; }
    .header-inner { display: flex; justify-content: space-between; align-items: center; }
    .logo { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 20px; }
    .logo-icon { width: 40px; height: 40px; border-radius: 12px; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 16px; }
    .nav { display: flex; gap: 24px; }
    .nav a { color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
    .nav a:hover { color: var(--accent); }
    
    /* Hero */
    .hero { padding: 160px 0 100px; text-align: center; }
    .hero-badge { display: inline-block; padding: 8px 16px; background: rgba(250, 204, 21, 0.1); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 20px; font-size: 14px; color: var(--accent); margin-bottom: 24px; }
    .hero-title { font-size: 56px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; letter-spacing: -2px; }
    .hero-desc { font-size: 20px; color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
    .hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    
    /* Features */
    .features { padding: 80px 0; }
    .section-title { font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 48px; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .feature-card { padding: 32px; }
    .feature-icon { font-size: 48px; margin-bottom: 20px; }
    .feature-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
    .feature-desc { color: var(--text-secondary); line-height: 1.6; }
    
    /* Catalog (for ecommerce) */
    .catalog { padding: 80px 0; }
    .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; }
    .product-card { overflow: hidden; }
    .product-image { width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, var(--bg-elevated), var(--bg-card)); display: flex; align-items: center; justify-content: center; font-size: 64px; }
    .product-info { padding: 20px; }
    .product-title { font-weight: 600; margin-bottom: 8px; }
    .product-price { font-size: 20px; font-weight: 700; color: var(--accent); }
    .product-btn { margin-top: 12px; width: 100%; }
    
    /* Footer */
    .footer { border-top: 1px solid var(--border); padding: 40px 0; text-align: center; color: var(--text-secondary); }
    
    @media (max-width: 768px) {
      .hero-title { font-size: 36px; }
      .hero { padding: 120px 0 60px; }
      .nav { display: none; }
    }
  `;
}

// === ГЕНЕРАЦИЯ HTML ПО ТИПУ ===

function generateEcommerceHTML(ctx: PrototypeContext): string {
  const { productName, idea, productType } = ctx;
  const functions = idea.functions.slice(0, 6);
  
  // Generate product cards from functions
  const productCards = functions.map((func, i) => `
    <div class="card product-card fade-in" style="animation-delay: ${i * 0.1}s">
      <div class="product-image">${getIcon(func)}</div>
      <div class="product-info">
        <div class="product-title">${func.substring(0, 40)}</div>
        <div class="product-price">от ${(Math.random() * 10000 + 500).toFixed(0)}₽</div>
        <button class="btn btn-primary product-btn" onclick="addToCart('${func.substring(0, 20)}')">${productType.primaryAction}</button>
      </div>
    </div>
  `).join('\n');

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName} — ${productType.category}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>${generateCSS(productType)}</style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <div class="logo">
        <div class="logo-icon">${productName.substring(0, 2).toUpperCase()}</div>
        <span>${productName}</span>
      </div>
      <nav class="nav">
        <a href="#catalog">Каталог</a>
        <a href="#features">О нас</a>
        <a href="#contact">Контакты</a>
      </nav>
      <button class="btn btn-secondary" onclick="showCart()">🛒 Корзина</button>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-badge animate-float">${productType.category}</div>
        <h1 class="hero-title">${productName}</h1>
        <p class="hero-desc">${idea.description}</p>
        <div class="hero-buttons">
          <a href="#catalog" class="btn btn-primary animate-glow">Смотреть каталог</a>
          <button class="btn btn-secondary">Узнать больше</button>
        </div>
      </div>
    </section>

    <section id="catalog" class="catalog">
      <div class="container">
        <h2 class="section-title">Каталог</h2>
        <div class="catalog-grid">
          ${productCards}
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Почему выбирают нас</h2>
        <div class="features-grid">
          ${productType.secondaryActions.map((action, i) => `
            <div class="card feature-card fade-in" style="animation-delay: ${i * 0.1}s">
              <div class="feature-icon">${getIcon(action)}</div>
              <div class="feature-title">${action}</div>
              <div class="feature-desc">Качественный сервис и профессиональная консультация по всем вопросам.</div>
            </div>
          `).join('\n')}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>© 2024 ${productName}. Все права защищены.</p>
    </div>
  </footer>

  <script>
    let cart = [];
    function addToCart(item) {
      cart.push(item);
      alert('Добавлено в корзину: ' + item);
    }
    function showCart() {
      alert('В корзине: ' + cart.length + ' товаров');
    }
  </script>
</body>
</html>`;
}

function generateLandingHTML(ctx: PrototypeContext): string {
  const { productName, idea, productType } = ctx;
  const functions = idea.functions.slice(0, 4);

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName} — ${productType.category}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>${generateCSS(productType)}</style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <div class="logo">
        <div class="logo-icon">${productName.substring(0, 2).toUpperCase()}</div>
        <span>${productName}</span>
      </div>
      <button class="btn btn-primary">${productType.primaryAction}</button>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <h1 class="hero-title gradient-text">${productName}</h1>
        <p class="hero-desc">${idea.description}</p>
        <div class="hero-buttons">
          <button class="btn btn-primary animate-glow">${productType.primaryAction}</button>
          <button class="btn btn-secondary">Подробнее</button>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2 class="section-title">Возможности</h2>
        <div class="features-grid">
          ${functions.map((func, i) => `
            <div class="card feature-card fade-in" style="animation-delay: ${i * 0.1}s">
              <div class="feature-icon">${getIcon(func)}</div>
              <div class="feature-title">${func.substring(0, 50)}</div>
              <div class="feature-desc">Ключевая возможность продукта для решения ваших задач.</div>
            </div>
          `).join('\n')}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>© 2024 ${productName}</p>
    </div>
  </footer>
</body>
</html>`;
}

function generateSaaSHTML(ctx: PrototypeContext): string {
  const { productName, idea, productType } = ctx;
  const functions = idea.functions.slice(0, 6);

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName} — ${productType.category}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>${generateCSS(productType)}</style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <div class="logo">
        <div class="logo-icon">${productName.substring(0, 2).toUpperCase()}</div>
        <span>${productName}</span>
      </div>
      <nav class="nav">
        <a href="#features">Функции</a>
        <a href="#pricing">Тарифы</a>
        <a href="#contact">Контакты</a>
      </nav>
      <button class="btn btn-primary">${productType.primaryAction}</button>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-badge animate-float">${productType.category}</div>
        <h1 class="hero-title">${productName}</h1>
        <p class="hero-desc">${idea.description}</p>
        <div class="hero-buttons">
          <button class="btn btn-primary animate-glow">Начать бесплатно</button>
          <button class="btn btn-secondary">Смотреть демо</button>
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Возможности платформы</h2>
        <div class="features-grid">
          ${functions.map((func, i) => `
            <div class="card feature-card fade-in" style="animation-delay: ${i * 0.1}s">
              <div class="feature-icon">${getIcon(func)}</div>
              <div class="feature-title">${func.substring(0, 50)}</div>
              <div class="feature-desc">Автоматизация и оптимизация процессов.</div>
            </div>
          `).join('\n')}
        </div>
      </div>
    </section>

    <section id="pricing" class="features">
      <div class="container">
        <h2 class="section-title">Тарифы</h2>
        <div class="features-grid">
          <div class="card feature-card">
            <div class="feature-title">Старт</div>
            <div class="feature-desc">Бесплатно для начинающих</div>
            <button class="btn btn-secondary" style="margin-top: 16px; width: 100%;">Выбрать</button>
          </div>
          <div class="card feature-card" style="border-color: var(--accent);">
            <div class="feature-title">Профи</div>
            <div class="feature-desc">990₽/мес — для команд</div>
            <button class="btn btn-primary" style="margin-top: 16px; width: 100%;">Выбрать</button>
          </div>
          <div class="card feature-card">
            <div class="feature-title">Бизнес</div>
            <div class="feature-desc">По запросу — Enterprise</div>
            <button class="btn btn-secondary" style="margin-top: 16px; width: 100%;">Связаться</button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>© 2024 ${productName}</p>
    </div>
  </footer>
</body>
</html>`;
}

function generateBlogHTML(ctx: PrototypeContext): string {
  const { productName, idea, productType } = ctx;
  const functions = idea.functions.slice(0, 4);

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName} — ${productType.category}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>${generateCSS(productType)}</style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <div class="logo">
        <div class="logo-icon">${productName.substring(0, 2).toUpperCase()}</div>
        <span>${productName}</span>
      </div>
      <nav class="nav">
        <a href="#articles">Статьи</a>
        <a href="#categories">Категории</a>
        <a href="#about">О проекте</a>
      </nav>
      <button class="btn btn-secondary">Подписаться</button>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">${productName}</h1>
        <p class="hero-desc">${idea.description}</p>
      </div>
    </section>

    <section id="articles" class="features">
      <div class="container">
        <h2 class="section-title">Последние публикации</h2>
        <div class="features-grid">
          ${functions.map((func, i) => `
            <div class="card feature-card fade-in" style="animation-delay: ${i * 0.1}s; cursor: pointer;">
              <div class="feature-icon">${getIcon(func)}</div>
              <div class="feature-title">${func.substring(0, 50)}</div>
              <div class="feature-desc">Статья о ключевых аспектах темы...</div>
            </div>
          `).join('\n')}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>© 2024 ${productName}</p>
    </div>
  </footer>
</body>
</html>`;
}

function generateAppHTML(ctx: PrototypeContext): string {
  const { productName, idea, productType } = ctx;
  const functions = idea.functions.slice(0, 6);

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>${generateCSS(productType)}</style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <div class="logo">
        <div class="logo-icon">${productName.substring(0, 2).toUpperCase()}</div>
        <span>${productName}</span>
      </div>
      <button class="btn btn-primary">${productType.primaryAction}</button>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-badge animate-float">${productType.category}</div>
        <h1 class="hero-title gradient-text">${productName}</h1>
        <p class="hero-desc">${idea.description}</p>
        <div class="hero-buttons">
          <button class="btn btn-primary animate-glow">${productType.primaryAction}</button>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2 class="section-title">Возможности</h2>
        <div class="features-grid">
          ${functions.map((func, i) => `
            <div class="card feature-card fade-in" style="animation-delay: ${i * 0.1}s">
              <div class="feature-icon">${getIcon(func)}</div>
              <div class="feature-title">${func.substring(0, 50)}</div>
            </div>
          `).join('\n')}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>© 2024 ${productName}</p>
    </div>
  </footer>
</body>
</html>`;
}

// === ГЛАВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ===

export function generateContextualPrototype(ctx: PrototypeContext): string {
  const { productName, productType } = ctx;
  
  console.log(`[Prototype Generator] Type: ${productType.type}, Category: ${productType.category}`);
  
  let html = '';
  
  switch (productType.type) {
    case 'ecommerce':
      html = generateEcommerceHTML(ctx);
      break;
    case 'landing':
      html = generateLandingHTML(ctx);
      break;
    case 'saas':
    case 'b2b':
    case 'dashboard':
      html = generateSaaSHTML(ctx);
      break;
    case 'blog':
    case 'content':
      html = generateBlogHTML(ctx);
      break;
    default:
      html = generateAppHTML(ctx);
  }

  return `## 🎨 Интерактивный прототип "${productName}"

**Тип продукта:** ${productType.category}
**Основное действие:** ${productType.primaryAction}

\`\`\`html
${html}
\`\`\``;
}
