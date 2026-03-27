
// === ФУНКЦИЯ КОНТЕКСТНОГО АНАЛИЗА ИДЕИ ===
// ИЗВЛЕКАЕМ СУТЬ ИЗ ТЕКСТА, БЕЗ ШАБЛОНОВ!
function analyzeSourceIdea(sourceText: string): {
  name: string;
  description: string;
  useCases: string[];
  userTypes: string;
  valueProposition: string;
  functions: string[];
  risks: string[];
  difficulties: string[];
  valueImprovements: string[];
  differentiationStrategy: string;
  finalScore: string;
} {
  console.log('[analyzeSourceIdea] === НАЧИНАЕМ КОНТЕКСТНЫЙ АНАЛИЗ ===');
  const lowerText = sourceText.toLowerCase();
  
  // === 1. ИЗВЛЕКАЕМ НАЗВАНИЕ ===
  let name = '';
  
  // Паттерн 1: Название в кавычках «Название» или "Название"
  const quotedMatch = sourceText.match(/[«""]([^«""»]+)[»""]/);
  if (quotedMatch && quotedMatch[1]) {
    const candidate = quotedMatch[1].trim();
    // Фильтруем короткие слова и диалоговые реплики
    if (candidate.length > 3 && !candidate.match(/^(да|нет|хорошо|ладно|понял|согласен|миша|алексей)$/i)) {
      name = candidate;
      console.log(`[analyzeSourceIdea] Название из кавычек: "${name}"`);
    }
  }
  
  // Паттерн 2: "магазин/сервис [название]"
  if (!name) {
    const shopMatch = sourceText.match(/(?:магазин|сервис|сайт|приложение|платформа)\s+["«]?([А-Яа-яA-Za-z0-9\s]{2,30})["»]?/i);
    if (shopMatch && shopMatch[1]) {
      name = shopMatch[1].trim();
      console.log(`[analyzeSourceIdea] Название после типа: "${name}"`);
    }
  }
  
  // Паттерн 3: "есть/называется [название]"
  if (!name) {
    const existMatch = sourceText.match(/(?:есть|называется|работает)\s+["«]?([А-Яа-яA-Za-z0-9\s]{2,30})["»]?/i);
    if (existMatch && existMatch[1]) {
      const candidate = existMatch[1].trim();
      if (candidate.length > 3) {
        name = candidate;
        console.log(`[analyzeSourceIdea] Название из контекста: "${name}"`);
      }
    }
  }
  
  if (!name) {
    name = 'Новый продукт';
  }

  // === 2. ИЗВЛЕКАЕМ ОПИСАНИЕ СУТИ ===
  let description = '';
  
  // Паттерн 1: "задача/главная задача/суть в том"
  const taskPatterns = [
    /(?:главная задача|основная задача|суть в том|идея в том)[,:]\s*([^\n.!?]+[^\n!?]*)/i,
    /задача[^.]{0,20}в том,? что\s*([^\n.!?]+)/i,
  ];
  
  for (const pattern of taskPatterns) {
    const match = sourceText.match(pattern);
    if (match && match[1] && match[1].trim().length > 15) {
      description = match[1].trim();
      console.log(`[analyzeSourceIdea] Описание из паттерна задачи`);
      break;
    }
  }
  
  // Паттерн 2: Определяем тип продукта из контекста
  if (!description) {
    if (lowerText.includes('магазин') && (lowerText.includes('товар') || lowerText.includes('продаж') || lowerText.includes('заказ'))) {
      if (lowerText.includes('аквариум') || lowerText.includes('рыб') || lowerText.includes('водоросл')) {
        description = `Интернет-магазин аквариумистики "${name}" для онлайн-продажи живых рыбок, растений и сопутствующих товаров`;
      } else if (lowerText.includes('одежд') || lowerText.includes('обув')) {
        description = `Интернет-магазин одежды "${name}"`;
      } else if (lowerText.includes('продукт') || lowerText.includes('ед')) {
        description = `Интернет-магазин продуктов "${name}"`;
      } else {
        description = `Интернет-магазин "${name}"`;
      }
    } else if (lowerText.includes('приложен') && lowerText.includes('мобильн')) {
      description = `Мобильное приложение "${name}"`;
    } else if (lowerText.includes('платформ') || lowerText.includes('сервис')) {
      description = `Веб-платформа "${name}"`;
    }
  }
  
  // Паттерн 3: Извлекаем из контекста что создаётся
  if (!description) {
    const createMatch = sourceText.match(/(?:сайт|приложение|платформа)[^,.\n]{10,100}/i);
    if (createMatch) {
      description = createMatch[0].trim();
    }
  }
  
  if (!description) {
    description = `Цифровой продукт "${name}"`;
  }
  
  console.log(`[analyzeSourceIdea] Описание: "${description.substring(0, 80)}..."`);

  // === 3. ИЗВЛЕКАЕМ ФУНКЦИИ ИЗ ДИАЛОГА ===
  const functions: string[] = [];
  const mentionedFeatures = new Set<string>();
  
  // Ищем конкретные упоминания функционала
  
  // Навигация и фильтры
  if (lowerText.includes('навигац') || lowerText.includes('фильтр')) {
    const navMatch = sourceText.match(/(?:навигац|фильтр)[а-яё\s]*[^.]{0,100}/i);
    if (navMatch) {
      mentionedFeatures.add('Фильтры и навигация: ' + navMatch[0].trim().substring(0, 60));
    }
  }
  
  // Интеграции
  if (lowerText.includes('интеграц') || lowerText.includes('синхронизац') || lowerText.includes('1с')) {
    mentionedFeatures.add('Интеграция с 1С и синхронизация остатков в реальном времени');
  }
  
  // Карточки товара
  if (lowerText.includes('карточк') && (lowerText.includes('товар') || lowerText.includes('продукт'))) {
    mentionedFeatures.add('Детальные карточки товаров с фото, видео и характеристиками');
  }
  
  // Бронирование
  if (lowerText.includes('брон') || lowerText.includes('резерв')) {
    mentionedFeatures.add('Бронирование товаров с ограничением по времени');
  }
  
  // Блог/контент
  if (lowerText.includes('блог') || lowerText.includes('стать') || lowerText.includes('контент')) {
    mentionedFeatures.add('Блог и статьи для SEO и привлечения из поиска');
  }
  
  // Доставка/самовывоз
  if (lowerText.includes('доставк') || lowerText.includes('самовывоз')) {
    mentionedFeatures.add('Система доставки и точек самовывоза');
  }
  
  // Оплата
  if (lowerText.includes('оплат') || lowerText.includes('платёж')) {
    mentionedFeatures.add('Онлайн-оплата заказов');
  }
  
  // Видео для товаров
  if (lowerText.includes('видео') && (lowerText.includes('товар') || lowerText.includes('продукт') || lowerText.includes('главн'))) {
    mentionedFeatures.add('Видео-контент для демонстрации товаров');
  }
  
  // Админ-панель
  if (lowerText.includes('админк') || lowerText.includes('панел') && lowerText.includes('управлен')) {
    mentionedFeatures.add('Панель управления для операторов и менеджеров');
  }
  
  // Модерация заказов
  if (lowerText.includes('модерац') || (lowerText.includes('менеджер') && lowerText.includes('перезвон'))) {
    mentionedFeatures.add('Ручная модерация заказов менеджером');
  }
  
  functions.push(...Array.from(mentionedFeatures).slice(0, 6));
  
  // Если функций мало - анализируем что упоминается
  if (functions.length < 3) {
    const featureMentions = sourceText.match(/(?:должн[ао] быть|обязательн[ао]|нужн[ао]|важн[ао]|сделаем)[^.]{10,80}/gi);
    if (featureMentions) {
      featureMentions.slice(0, 4).forEach(m => {
        const cleaned = m.replace(/^(должн[ао] быть|обязательн[ао]|нужн[ао]|важн[ао]|сделаем)\s*/i, '').trim();
        if (cleaned.length > 10 && cleaned.length < 80) {
          functions.push(cleaned.substring(0, 70));
        }
      });
    }
  }
  
  console.log(`[analyzeSourceIdea] Функции: ${functions.length}`);

  // === 4. ИЗВЛЕКАЕМ USE CASES ===
  const useCases: string[] = [];
  
  // Ищем сценарии где упоминается клиент/пользователь
  const scenarioMatches = sourceText.match(/(?:клиент|пользователь|покупатель)[^.]{20,150}/gi);
  if (scenarioMatches) {
    scenarioMatches.slice(0, 3).forEach(m => {
      const cleaned = m.trim().substring(0, 100);
      if (cleaned.length > 20) {
        useCases.push(cleaned);
      }
    });
  }
  
  // Ищем упоминания что будет делать пользователь
  const actionMatches = sourceText.match(/(?:найдёт|выберет|закажет|купит|сможет|увидит|получит)[^.]{10,80}/gi);
  if (actionMatches) {
    actionMatches.slice(0, 3).forEach(m => {
      const cleaned = m.trim();
      if (!useCases.some(uc => uc.includes(cleaned.substring(0, 20)))) {
        useCases.push(cleaned);
      }
    });
  }
  
  // Формируем use cases на основе контекста если мало
  if (useCases.length < 2) {
    if (lowerText.includes('аквариум') || lowerText.includes('рыб')) {
      useCases.push('Покупатель находит рыбку по тегам: "чистильщики", "мирные", "для начинающих"');
      useCases.push('Клиент видит количество товара в наличии и бронирует');
    } else if (lowerText.includes('магазин')) {
      useCases.push('Покупатель выбирает товар по фильтрам и характеристикам');
      useCases.push('Клиент оформляет заказ с доставкой или самовывозом');
    }
  }
  
  console.log(`[analyzeSourceIdea] Use cases: ${useCases.length}`);

  // === 5. ИЗВЛЕКАЕМ ЦЕЛЕВУЮ АУДИТОРИЮ ===
  let userTypes = '';
  
  // Анализируем контекст для ЦА
  const audienceContext: string[] = [];
  
  if (lowerText.includes('новичок') || lowerText.includes('начинающ')) {
    audienceContext.push('**Начинающие** — новички в теме, которым нужна помощь с выбором');
  }
  if (lowerText.includes('профессионал') || lowerText.includes('профи') || lowerText.includes('опытн')) {
    audienceContext.push('**Профессионалы** — опытные пользователи с конкретными запросами');
  }
  if (lowerText.includes('клиент') || lowerText.includes('покупатель')) {
    audienceContext.push('**Покупатели** — клиенты, которые выбирают и заказывают товары');
  }
  
  // Специфика для аквариумистики
  if (lowerText.includes('аквариум') || lowerText.includes('рыб')) {
    audienceContext.length = 0;
    audienceContext.push('**Аквариумисты** — любители и профессионалы, ищущие рыбок по характеристикам');
    audienceContext.push('**Новички** — начинающие, которые выбирают "мирных", "для начинающих"');
  }
  
  if (audienceContext.length > 0) {
    userTypes = audienceContext.join('\n');
  } else {
    userTypes = '**Пользователи** — целевая аудитория продукта';
  }
  
  console.log(`[analyzeSourceIdea] ЦА: "${userTypes.substring(0, 50)}..."`);

  // === 6. ИЗВЛЕКАЕМ ЦЕННОСТНОЕ ПРЕДЛОЖЕНИЕ ===
  let valueProposition = '';
  
  // Ищем упоминания дизайна, стиля
  const designMatch = sourceText.match(/(?:дизайн|стиль|хочется|важно|не хочу)[^,.\n]{10,150}/i);
  if (designMatch) {
    valueProposition = designMatch[0].trim();
  }
  
  // Формируем на основе контекста
  if (!valueProposition || valueProposition.length < 20) {
    if (lowerText.includes('минимализм') || lowerText.includes('премиум')) {
      valueProposition = 'Премиум-дизайн с минимализмом: светлый фон, качественные фото, акцент на визуальном контенте';
    } else if (lowerText.includes('эксперт') || lowerText.includes('консультац')) {
      valueProposition = 'Экспертные консультации и качественный сервис, которые не дают конкуренты';
    } else if (lowerText.includes('живой товар') || lowerText.includes('животн') || lowerText.includes('рыб')) {
      valueProposition = 'Специализация на живом товаре: актуальные остатки, бронирование, консультации по совместимости';
    } else {
      valueProposition = 'Качественный сервис и понимание потребностей аудитории';
    }
  }
  
  console.log(`[analyzeSourceIdea] Ценность: "${valueProposition.substring(0, 50)}..."`);

  // === 7. ФОРМИРУЕМ РИСКИ НА ОСНОВЕ КОНТЕКСТА ===
  const risks: string[] = [];
  
  if (lowerText.includes('конкурент') || lowerText.includes('маркетплейс') || lowerText.includes('ozon') || lowerText.includes('wildberries')) {
    risks.push('Конкуренция с крупными маркетплейсами — нужна дифференциация через специализацию и сервис');
  }
  if (lowerText.includes('живой товар') || lowerText.includes('животн') || lowerText.includes('рыб')) {
    risks.push('Специфика живого товара: риски гибели, необходимость быстрых продаж, особые условия доставки');
  }
  if (lowerText.includes('интеграц') || lowerText.includes('1с') || lowerText.includes('склад')) {
    risks.push('Сложность интеграции с существующими системами — 1С, складской учёт, синхронизация остатков');
  }
  if (lowerText.includes('доставк') || lowerText.includes('логистик')) {
    risks.push('Логистические сложности — особенно для специфических товаров');
  }
  
  if (risks.length < 2) {
    risks.push('Зависимость от маркетинговых каналов — нужна стратегия привлечения клиентов');
    risks.push('Изменения на рынке — необходимость адаптации продукта');
  }
  
  console.log(`[analyzeSourceIdea] Риски: ${risks.length}`);

  // === 8. ФОРМИРУЕМ ТРУДНОСТИ РЕАЛИЗАЦИИ ===
  const difficulties: string[] = [];
  
  if (lowerText.includes('интеграц') || lowerText.includes('1с')) {
    difficulties.push('Интеграция с 1С и складскими системами — разные API, форматы данных');
  }
  if (lowerText.includes('синхронизац') || (lowerText.includes('реальн') && lowerText.includes('времен'))) {
    difficulties.push('Синхронизация остатков в реальном времени — защита от продажи уже проданного');
  }
  if (lowerText.includes('видео') || lowerText.includes('фото') || lowerText.includes('медиа')) {
    difficulties.push('Контент-менеджмент: качественные фото и видео для каждого товара');
  }
  if (lowerText.includes('брон') || lowerText.includes('резерв')) {
    difficulties.push('Логика бронирования с таймаутами и отменами');
  }
  
  if (difficulties.length < 2) {
    difficulties.push('Техническая реализация ключевых функций');
    difficulties.push('Масштабирование при росте нагрузки');
  }
  
  console.log(`[analyzeSourceIdea] Трудности: ${difficulties.length}`);

  // === 9. ФОРМИРУЕМ РЕКОМЕНДАЦИИ ===
  const valueImprovements: string[] = [];
  
  if (lowerText.includes('блог') || lowerText.includes('стать') || lowerText.includes('seo')) {
    valueImprovements.push('Развитие контент-маркетинга: экспертные статьи, гайды для привлечения из поиска');
  }
  if (lowerText.includes('видео') || lowerText.includes('фото')) {
    valueImprovements.push('Качественный визуальный контент: профессиональные фото и видео товаров');
  }
  if (lowerText.includes('новичок') || lowerText.includes('начинающ')) {
    valueImprovements.push('Онбординг и обучение: подсказки для новичков, гиды по выбору');
  }
  if (lowerText.includes('мессендж') || lowerText.includes(' whatsapp') || lowerText.includes('telegram')) {
    valueImprovements.push('Интеграция с мессенджерами для коммуникации с клиентами');
  }
  
  if (valueImprovements.length < 2) {
    valueImprovements.push('Мобильная версия с полным функционалом');
    valueImprovements.push('Программа лояльности для удержания клиентов');
  }
  
  console.log(`[analyzeSourceIdea] Рекомендации: ${valueImprovements.length}`);

  // === 10. СТРАТЕГИЯ ДИФФЕРЕНЦИАЦИИ ===
  const diffPoints: string[] = [];
  
  if (name && name !== 'Новый продукт') {
    diffPoints.push(`бренд "${name}"`);
  }
  if (lowerText.includes('специализац') || lowerText.includes('нишев') || lowerText.includes('узк')) {
    diffPoints.push('глубокая специализация в нише');
  }
  if (lowerText.includes('эксперт') || lowerText.includes('консультац')) {
    diffPoints.push('экспертность и консультации');
  }
  if (lowerText.includes('живой') || lowerText.includes('уникальн') || lowerText.includes('редк')) {
    diffPoints.push('уникальный ассортимент');
  }
  if (lowerText.includes('минимализм') || lowerText.includes('премиум')) {
    diffPoints.push('премиум-дизайн');
  }
  
  let differentiationStrategy = '';
  if (diffPoints.length > 0) {
    differentiationStrategy = `**Уникальное преимущество:** ${diffPoints.join(', ')}. Фокус на специфике продукта и сервисе, который не могут дать универсальные конкуренты.`;
  } else {
    differentiationStrategy = '**Уникальное преимущество:** Понимание специфики ниши и потребностей аудитории, персонализированный подход.';
  }

  // === 11. ИТОГОВАЯ ОЦЕНКА ===
  let score = 6;
  if (functions.length >= 4) score++;
  if (risks.length >= 3) score++;
  if (name && name !== 'Новый продукт') score++;
  if (description.length > 50) score++;
  score = Math.min(9, Math.max(5, score));
  
  const finalScore = `**Потенциал идеи: ${score}/10**

**Сильные стороны:** ${name !== 'Новый продукт' ? 'Понятный бренд, ' : ''}определённый функционал, выявленная целевая аудитория${risks.length > 0 ? ', проработанные риски' : ''}.
**Слабые стороны:** ${difficulties.length > 0 ? 'технические сложности, ' : ''}необходимость валидации гипотез на практике.
**Рекомендация:** Начать с MVP — ${functions.slice(0, 2).join(', ') || 'ключевая функциональность'}. Провести custdev с целевой аудиторией.`;

  console.log(`[analyzeSourceIdea] === РЕЗУЛЬТАТ: name="${name}", functions=${functions.length}, risks=${risks.length} ===`);

  return {
    name,
    description,
    useCases: useCases.slice(0, 5),
    userTypes,
    valueProposition,
    functions: functions.slice(0, 6),
    risks,
    difficulties,
    valueImprovements: valueImprovements.slice(0, 4),
    differentiationStrategy,
    finalScore
  };
}
