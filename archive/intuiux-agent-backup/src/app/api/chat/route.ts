import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const AGENT_PROMPTS: Record<string, string> = {
  transcription_analyst: `Ты — эксперт по анализу идей продуктов. 
КРИТИЧЕСКИ ВАЖНО: Анализируй КОНКРЕТНЫЙ текст пользователя. 
- НЕ используй шаблоны интернет-магазина
- НЕ придумывай абстрактные продукты
- Извлекай идею ТОЛЬКО из предоставленного текста
Отвечай на русском языке.`,
  
  brand_marketer: `Ты — маркетолог с 15-летним опытом конкурентного анализа.
КРИТИЧЕСКИ ВАЖНО: 
- Анализируй КОНКРЕТНУЮ идею из раздела "СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА"
- НЕ используй шаблоны интернет-магазина
- Ищи РЕАЛЬНЫХ конкурентов для этого типа продукта
- Если в идее указан конкретный продукт (например, "приложение для поиска попутчиков"), ищи конкурентов ИМЕННО в этой нише
Отвечай на русском языке.`,
  
  cjm_researcher: `Ты — исследователь Customer Journey Map.
КРИТИЧЕСКИ ВАЖНО:
- Создавай CJM ТОЛЬКО для продукта из раздела "СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА"
- НЕ используй шаблоны интернет-магазина
- Этапы пути должны отражать КОНКРЕТНЫЕ функции этого продукта
- Используй Mermaid journey для визуализации
Отвечай на русском языке.`,
  
  ia_architect: `Ты — архитектор информационной архитектуры.
КРИТИЧЕСКИ ВАЖНО:
- Создавай ИА ТОЛЬКО для продукта из раздела "СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА"
- НЕ используй шаблоны интернет-магазина
- Сущности и разделы должны отражать КОНКРЕТНЫЕ функции этого продукта
- Используй Mermaid mindmap и erDiagram
Отвечай на русском языке.`,
  
  task_architect: `Ты — специалист по юзабилити-тестированию.
КРИТИЧЕСКИ ВАЖНО:
- Создавай материалы ТОЛЬКО для продукта из раздела "СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА"
- НЕ используй шаблоны интернет-магазина
- Задачи и вопросы должны относиться к КОНКРЕТНЫМ функциям этого продукта
Отвечай на русском языке.`,
  
  prototyper: `Ты — прототипировщик интерактивных HTML приложений в стиле Taiga (https://taiga-landing.vercel.app/).

═══════════════════════════════════════════════════════════════
🎯 КОНТЕКСТНАЯ ГЕНЕРАЦИЯ (КРИТИЧЕСКИ ВАЖНО)
═══════════════════════════════════════════════════════════════

Ты должен создать прототип на основе ВСЕХ предыдущих этапов:

1. **ИЗ ИДЕИ** возьми:
   - Название продукта
   - Описание сути проблемы
   - Целевую аудиторию
   - Ключевые функции (максимум 5)

2. **ИЗ КОНКУРЕНТОВ** возьми:
   - Уникальное преимущество (дифференциация)
   - Функции, которых нет у конкурентов

3. **ИЗ CJM** возьми:
   - Ключевые точки касания
   - Эмоциональное состояние пользователя
   - Pain points для решения

4. **ИЗ IA** возьми:
   - Структуру разделов приложения
   - Ключевые сущности

5. **ИЗ USERFLOW** возьми:
   - Последовательность экранов
   - Переходы между шагами
   - Ключевые действия пользователя

═══════════════════════════════════════════════════════════════
🎨 ДИЗАЙН-СИСТЕМА TAIGA
═══════════════════════════════════════════════════════════════

Цвета:
- Фон: #000000, #0A0A0A, #141414
- Акцент: #FACC15 (жёлтый) — кнопки, иконки, важные метрики
- Текст: #FFFFFF (основной), #A3A3A3 (вторичный), #737373 (muted)
- Success: #22C55E, Error: #EF4444

Шрифты:
- Inter — для всего текста
- JetBrains Mono — для цифр и кода

Анимации (CSS keyframes):
- float: translateY для парящих элементов
- glow: box-shadow для свечения
- shimmer: background-position для мерцания текста
- pulse: scale для пульсации
- scanline: translateY для линии сканирования

Эффекты:
- Backdrop blur на header
- Card glow при hover
- Grid background
- Gradient text

═══════════════════════════════════════════════════════════════
📱 СТРУКТУРА ПРИЛОЖЕНИЯ (адаптируй под Userflow!)
═══════════════════════════════════════════════════════════════

Реализуй многоэкранное приложение с навигацией через showScreen(id):

1. **SPLASH/HERO экран** 
   - Логотип продукта (первые буквы названия)
   - Название из Идеи
   - Value proposition из Идеи
   - CTA кнопка "Начать"

2. **ONBOARDING** (2-3 шага)
   - Знакомство с ключевыми функциями из Идеи
   - Прогресс-бар
   - Кнопки "Далее/Пропустить"

3. **ГЛАВНЫЙ ЭКРАН (Dashboard)**
   - Header с навигацией
   - Виджеты с метриками (из Идеи и CJM)
   - Быстрые действия (функции из Идеи)
   - Bottom navigation

4. **ЭКРАНЫ ФУНКЦИЙ** (для каждого ключевого действия из Userflow)
   - Формы ввода данных
   - Кнопки действий
   - Отображение результатов
   - Навигация "Назад"

5. **РЕЗУЛЬТАТ/УСПЕХ**
   - Подтверждение действия
   - Иконка успеха
   - Кнопки "На главную/Новое действие"

6. **ПРОФИЛЬ/НАСТРОЙКИ**
   - Информация пользователя
   - Настройки приложения
   - Выход

═══════════════════════════════════════════════════════════════
🔧 ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ
═══════════════════════════════════════════════════════════════

JavaScript функции:
- showScreen(id) — переключение экранов
- showTab(tabId) — переключение вкладок
- showToast(message) — уведомления

Формат:
- Полный HTML в одном блоке
- CSS в <style>
- JavaScript в <script>
- Google Fonts: Inter, JetBrains Mono

ВАЖНО:
- НЕ создавай landing page — создай ИНТЕРАКТИВНОЕ ПРИЛОЖЕНИЕ
- Каждый экран должен отражать КОНКРЕТНЫЙ контекст из Идеи
- Названия кнопок, заголовков — из Идеи и Userflow`
};

// === HELPER FUNCTIONS FOR AUTO-DEPLOYMENT ===

// Transliterate Russian to English for URL slug
function transliterateToSlug(text: string): string {
  const ruToEn: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo',
    'Ж': 'zh', 'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm',
    'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
    'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sch',
    'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya',
    ' ': '-', '_': '-', '/': '-', '\\': '-'
  };
  
  // Transliterate first, then clean up
  let slug = text
    .split('')
    .map(char => ruToEn[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '') // Keep only latin letters, numbers, and dashes
    .replace(/-+/g, '-') // Replace multiple dashes
    .replace(/^-|-$/g, '') // Trim dashes
    .substring(0, 50); // Limit length
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
}

// Extract product name from message or response
function extractProductName(message: string, response: string): string {
  // Try to find name in the response header
  const headerMatch = response.match(/## 🎨 Интерактивный прототип "?([^"\n]+)"?/);
  if (headerMatch && headerMatch[1]) {
    return headerMatch[1].trim();
  }
  
  // Try to find name in the message
  const ideaMatch = message.match(/Название идеи[^*]*\*\*([^*]+)\*\*/);
  if (ideaMatch && ideaMatch[1]) {
    return ideaMatch[1].trim();
  }
  
  // Try to find in ## 💡 section
  const nameMatch = message.match(/## 💡\s*Название идеи\s*\n\*?\*?([^*\n]+)/);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }
  
  return 'Prototype';
}

// Check accessibility
function checkAccessibility(html: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const imgWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
  if (imgWithoutAlt.length > 0) {
    issues.push(`Images without alt: ${imgWithoutAlt.length}`);
    score -= 10 * imgWithoutAlt.length;
  }
  
  if (!html.includes('<main') && !html.includes('role="main"')) {
    issues.push('Missing <main> element');
    score -= 5;
  }
  
  if (!html.includes('<header') && !html.includes('role="banner"')) {
    issues.push('Missing <header> element');
    score -= 5;
  }
  
  if (!html.includes('<nav') && !html.includes('role="navigation"')) {
    issues.push('Missing <nav> element');
    score -= 5;
  }
  
  if (!html.includes('lang=')) {
    issues.push('Missing lang attribute');
    score -= 5;
  }
  
  if (!html.includes('<title>')) {
    issues.push('Missing <title>');
    score -= 10;
  }
  
  if (!html.includes('viewport')) {
    issues.push('Missing viewport');
    score -= 5;
  }
  
  return { score: Math.max(0, Math.min(100, score)), issues };
}

// Deploy prototype to database
async function deployPrototype(productName: string, htmlContent: string): Promise<{
  success: boolean;
  deployment?: {
    id: string;
    productName: string;
    slug: string;
    url: string;
    accessibilityScore: number;
    accessibilityIssues: string[];
  };
  error?: string;
}> {
  try {
    // Extract HTML from markdown code block
    const htmlMatch = htmlContent.match(/```html\s*([\s\S]*?)```/);
    const cleanHtml = htmlMatch && htmlMatch[1] ? htmlMatch[1].trim() : htmlContent;
    
    const slug = transliterateToSlug(productName);
    const accessibility = checkAccessibility(cleanHtml);
    
    const deployment = await db.prototypeDeployment.create({
      data: {
        productName,
        slug,
        htmlContent: cleanHtml,
        accessibilityScore: accessibility.score,
        accessibilityIssues: JSON.stringify(accessibility.issues),
        status: 'deployed',
        vercelUrl: `/api/prototype/${slug}`,
        deployedAt: new Date()
      }
    });
    
    return {
      success: true,
      deployment: {
        id: deployment.id,
        productName: deployment.productName,
        slug: deployment.slug,
        url: deployment.vercelUrl || `/api/prototype/${deployment.slug}`,
        accessibilityScore: accessibility.score,
        accessibilityIssues: accessibility.issues
      }
    };
  } catch (error) {
    console.error('Deploy prototype error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deploy'
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { agentId, agentType, message, conversationId } = body;
    
    let actualAgentType = agentType;
    let agent = null;
    
    if (agentId && !agentType) {
      agent = await db.agent.findUnique({ where: { id: agentId } });
      if (agent) {
        actualAgentType = agent.type;
      }
    }
    
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }
    
    let conversation;
    const effectiveAgentId = agentId || `pipeline-${actualAgentType}`;
    
    const existingAgent = await db.agent.findUnique({ where: { id: effectiveAgentId } });
    const saveToDb = !!existingAgent;
    
    if (saveToDb) {
      if (conversationId) {
        conversation = await db.conversation.findUnique({ where: { id: conversationId } });
      }
      if (!conversation) {
        conversation = await db.conversation.create({
          data: { agentId: effectiveAgentId, title: message.substring(0, 50) }
        });
      }
    }
    
    if (saveToDb && conversation) {
      await db.message.create({
        data: { conversationId: conversation.id, role: 'user', content: message }
      });
    }
    
    const systemPrompt = AGENT_PROMPTS[actualAgentType] || `Ты — AI-ассистент. Помогай пользователю.`;
    
    let aiResponse = '';
    
    try {
      const zai = await getZAI();
      
      const messages = [
        { role: 'assistant' as const, content: systemPrompt },
        { role: 'user' as const, content: message }
      ];
      
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 30000);
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
    
    if (saveToDb && conversation) {
      await db.message.create({
        data: { conversationId: conversation.id, role: 'assistant', content: aiResponse }
      });
    }
    
    // Auto-deploy prototype after generation
    let deploymentInfo = null;
    if (actualAgentType === 'prototyper' && aiResponse.includes('```html')) {
      try {
        const productName = extractProductName(message, aiResponse);
        const deploymentResult = await deployPrototype(productName, aiResponse);
        if (deploymentResult.success) {
          deploymentInfo = deploymentResult.deployment;
          console.log(`[Auto-deploy] Prototype deployed: ${deploymentInfo.url}`);
          // Add deployment link to response
          aiResponse += `\n\n---\n\n## 🚀 Прототип развёрнут\n\n**Ссылка на прототип:** [${deploymentInfo.url}](${deploymentInfo.url})\n\n**Оценка доступности:** ${deploymentInfo.accessibilityScore}/100\n\n${deploymentInfo.accessibilityIssues.length > 0 ? `**Замечания по доступности:**\n${deploymentInfo.accessibilityIssues.map((i: string) => `- ${i}`).join('\n')}` : '✅ Все основные проверки доступности пройдены'}`;
        }
      } catch (deployError) {
        console.error('[Auto-deploy] Failed:', deployError);
      }
    }
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: conversation?.id || null,
      deployment: deploymentInfo
    });
    
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ success: false, error: 'Failed to process message' }, { status: 500 });
  }
}

// Extract idea from the message - improved version
function extractFormedIdea(message: string): { name: string; description: string; functions: string[] } {
  let ideaText = '';
  
  // Pattern 1: Section between separator lines with "СФОРМИРОВАННАЯ ИДЕЯ"
  const separatorMatch = message.match(/[═=]{5,}[^═=]*СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА[\s\S]*?[═=]{5,}/i);
  if (separatorMatch) {
    ideaText = separatorMatch[0];
    console.log('[extractFormedIdea] Found via pattern 1 (separator section)');
  }
  
  // Pattern 2: Look for the content after "СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА"
  if (!ideaText) {
    const ideaMatch = message.match(/СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА[\s\S]*?(?=Предыдущий контекст|═══|===|$)/i);
    if (ideaMatch) {
      ideaText = ideaMatch[0];
      console.log('[extractFormedIdea] Found via pattern 2 (ИДЕЯ header)');
    }
  }
  
  // Pattern 3: Look for ## 💡 section
  if (!ideaText) {
    const ideaMatch = message.match(/## 💡[^\n]*[\s\S]*?(?=## \d|===|Предыдущий|$)/i);
    if (ideaMatch) {
      ideaText = ideaMatch[0];
      console.log('[extractFormedIdea] Found via pattern 3 (## 💡 header)');
    }
  }
  
  if (!ideaText) {
    ideaText = message.substring(0, 1500);
    console.log('[extractFormedIdea] Using fallback - first 1500 chars');
  }
  
  // Extract name - clean from markdown
  let name = 'Продукт';
  
  // Pattern: ## 💡 Название идеи\n**Name** or ## 💡 Название идеи\nName
  const nameLineMatch = ideaText.match(/## 💡\s*Название идеи\s*\n\*?\*?([^*\n]+)\*?\*?/i);
  if (nameLineMatch && nameLineMatch[1]) {
    const extracted = nameLineMatch[1].trim();
    if (extracted.length > 2) {
      name = extracted;
      console.log(`[extractFormedIdea] Found name via header: "${name}"`);
    }
  }
  
  // Try bold text after "Название идеи"
  if (name === 'Продукт') {
    const boldMatch = ideaText.match(/Название идеи[^\n]*\n\s*\*\*([^*]+)\*\*/i);
    if (boldMatch && boldMatch[1]) {
      name = boldMatch[1].trim();
      console.log(`[extractFormedIdea] Found name via bold: "${name}"`);
    }
  }
  
  // Clean name from markdown and extra characters
  name = name.replace(/\*\*/g, '').replace(/["«»]/g, '').trim();
  
  // Extract description
  let description = 'Инновационный продукт для решения задач пользователей';
  const descPatterns = [
    /(?:Описание сути|Описание)[^:]*:?\s*([^\n]+(?:\n[^\n#]+)*?)(?=\n###|\n##|$)/i,
  ];
  
  for (const pattern of descPatterns) {
    const match = ideaText.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim().replace(/[═=*]/g, '').trim();
      if (extracted.length > 10) {
        description = extracted.substring(0, 200);
        break;
      }
    }
  }
  
  // Extract functions - properly from "Основные функции" section only
  const functions: string[] = [];
  
  // Pattern for "Основные функции" section
  const funcSectionMatch = ideaText.match(/(?:Основные функции|Функции)[^:]*:?\s*([\s\S]*?)(?=\n###|\n##|---|$)/i);
  if (funcSectionMatch && funcSectionMatch[1]) {
    const section = funcSectionMatch[1];
    // Match numbered items: 1. Function name
    const funcLines = section.match(/\d+\.\s+[^\n]+/g);
    if (funcLines) {
      funcLines.slice(0, 6).forEach(line => {
        const func = line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
        // Filter out metrics (they contain "цель:", "—", etc.)
        if (func && func.length > 5 && !func.includes('цель:') && !func.includes('— цель')) {
          functions.push(func.substring(0, 80));
        }
      });
    }
  }
  
  // Default functions if none found
  if (functions.length === 0) {
    functions.push('Основная функция продукта');
    functions.push('Дополнительные возможности');
    functions.push('Настройки и профиль');
  }
  
  console.log(`[extractFormedIdea] Result - name: "${name}", functions: [${functions.slice(0, 2).join(', ')}...]`);
  
  return { name, description, functions };
}

// === PRODUCT TYPE DETECTION ===

interface ProductType {
  id: string;
  name: string;
  keywords: string[];
  marketSize: string;
  trends: string[];
  barriers: string[];
  positioning: string;
}

interface Competitor {
  name: string;
  url: string;
  country: string;
  description: string;
  features: string;
  pricing: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  functionalityScore: string;
  priceScore: string;
  uxScore: string;
  supportScore: string;
}

interface IndirectCompetitor {
  name: string;
  description: string;
  approach: string;
  overlap: string;
  differentiation: string;
}

// База знаний о типах продуктов и их конкурентах
const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'ats',
    name: 'Виртуальная АТС / Телефония',
    keywords: ['атс', 'ats', 'телефон', 'звонок', 'call', 'ivr', 'голосовой', 'автоответчик', 'колл-центр', 'sip'],
    marketSize: '$15 млрд глобально, $500 млн в РФ (2024)',
    trends: ['Переход на облачные решения', 'Интеграция с CRM', 'AI-ассистенты для звонков', 'Омниканальность'],
    barriers: ['Интеграция с существующей инфраструктурой', 'Надёжность связи', 'Соблюдение законодательства'],
    positioning: 'современное решение для бизнеса с гибкими интеграциями'
  },
  {
    id: 'dashboard',
    name: 'Бизнес-дашборд / Аналитика',
    keywords: ['дашборд', 'dashboard', 'аналитик', 'метрик', 'отчёт', 'report', 'kpi', 'график', 'chart', 'bi-систем'],
    marketSize: '$25 млрд глобально (BI-рынок)',
    trends: ['Self-service аналитика', 'Real-time данные', 'AI-инсайты', 'Мобильные дашборды'],
    barriers: ['Качество данных', 'Сложность внедрения', 'Обучение пользователей'],
    positioning: 'интуитивный инструмент для принятия решений'
  },
  {
    id: 'crm',
    name: 'CRM-система',
    keywords: ['crm', 'клиент', 'customer', 'продаж', 'sales', 'лид', 'lead', 'сделк', 'deal'],
    marketSize: '$80 млрд глобально',
    trends: ['AI-прогнозирование продаж', 'Автоматизация процессов', 'Интеграция с мессенджерами'],
    barriers: ['Сопротивление сотрудников', 'Миграция данных', 'Сложность настройки'],
    positioning: 'простая CRM для малого и среднего бизнеса'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce / Интернет-магазин',
    keywords: ['магазин', 'shop', 'ecommerce', 'торгов', 'заказ', 'order', 'корзин', 'cart', 'товар', 'product'],
    marketSize: '$6 трлн глобально',
    trends: ['Маркетплейсы', 'Social commerce', 'Персонализация', 'Быстрая доставка'],
    barriers: ['Логистика', 'Конкуренция', 'Обработка платежей'],
    positioning: 'современная платформа электронной коммерции'
  },
  {
    id: 'messenger',
    name: 'Мессенджер / Чат-приложение',
    keywords: ['мессендж', 'messenger', 'чат', 'chat', 'сообщен', 'message', 'диалог'],
    marketSize: '$100 млрд+ глобально',
    trends: ['Шифрование', 'Боты и AI', 'Интеграции', 'Бизнес-функции'],
    barriers: ['Сетевой эффект', 'Привычки пользователей', 'Регулирование'],
    positioning: 'безопасный мессенджер для бизнеса и частного общения'
  },
  {
    id: 'task',
    name: 'Управление задачами / Проектами',
    keywords: ['задач', 'task', 'проект', 'project', 'kanban', 'trello', 'agile', 'scrumban'],
    marketSize: '$5 млрд глобально',
    trends: ['AI-планирование', 'Асинхронная работа', 'Интеграции', 'Геймификация'],
    barriers: ['Привычки команды', 'Сложность перехода', 'Обучение'],
    positioning: 'простой инструмент для командной работы'
  },
  {
    id: 'hr',
    name: 'HR-платформа / Управление персоналом',
    keywords: ['hr', 'кадр', 'персонал', 'сотрудник', 'employee', 'рекрут', 'найм', 'onboard'],
    marketSize: '$30 млрд глобально',
    trends: ['Remote work инструменты', 'AI-рекрутинг', 'Wellness программы', 'Аналитика персонала'],
    barriers: ['Защита персональных данных', 'Интеграция с существующими системами', 'Принятие HR'],
    positioning: 'современная платформа управления талантами'
  },
  {
    id: 'fintech',
    name: 'FinTech / Финансовое приложение',
    keywords: ['фин', 'fin', 'банк', 'bank', 'платёж', 'payment', 'деньги', 'money', 'бухгалт', 'account'],
    marketSize: '$300 млрд глобально',
    trends: ['Neobanking', 'Криптовалюты', 'BNPL', 'Открытые API'],
    barriers: ['Регулирование', 'Безопасность', 'Доверие пользователей'],
    positioning: 'финансовый инструмент для цифрового поколения'
  },
  {
    id: 'education',
    name: 'EdTech / Образовательная платформа',
    keywords: ['образован', 'education', 'курс', 'course', 'обучен', 'learning', 'студент', 'student'],
    marketSize: '$400 млрд глобально',
    trends: ['Microlearning', 'AI-персонализация', 'VR/AR', 'Геймификация'],
    barriers: ['Качество контента', 'Мотивация студентов', 'Аккредитация'],
    positioning: 'интерактивная платформа онлайн-обучения'
  },
  {
    id: 'health',
    name: 'HealthTech / Медицинское приложение',
    keywords: ['медицин', 'health', 'врач', 'doctor', 'здоров', 'health', 'клиник', 'clinic', 'пациент'],
    marketSize: '$500 млрд глобально',
    trends: ['Telemedicine', 'AI-диагностика', 'Wearables', 'Персонализированная медицина'],
    barriers: ['Регулирование', 'Защита данных', 'Принятие врачами'],
    positioning: 'цифровой помощник для здоровья'
  },
  {
    id: 'logistics',
    name: 'Логистика / Доставка',
    keywords: ['логистик', 'logistics', 'доставк', 'delivery', 'склад', 'warehouse', 'транспор', 'transport'],
    marketSize: '$200 млрд глобально',
    trends: ['Автономная доставка', 'Real-time трекинг', 'Оптимизация маршрутов AI', 'Устойчивость'],
    barriers: ['Инфраструктура', 'Регулирование', 'Стоимость'],
    positioning: 'умная платформа логистики'
  },
  {
    id: 'booking',
    name: 'Онлайн-запись / Бронирование',
    keywords: ['запись', 'брон', 'календар', 'слот', 'приём', 'расписание', 'записаться', 'онлайн-запись', 'yclients', 'dikidi', 'салон', 'мастер', 'клиник', 'красот', 'услуг'],
    marketSize: '$2 млрд глобально (online booking)',
    trends: ['Интеграция с мессенджерами', 'Автоматические напоминания', 'AI-подбор времени', 'Виджеты для сайтов'],
    barriers: ['Привычка записываться по телефону', 'Интеграция с календарями', 'Стоимость SMS'],
    positioning: 'простой сервис онлайн-записи для бизнеса'
  }
];

// База конкурентов по типам продуктов
const COMPETITORS_DB: Record<string, { direct: Competitor[]; indirect: IndirectCompetitor[] }> = {
  booking: {
    direct: [
      {
        name: 'YCLIENTS',
        url: 'https://yclients.ru',
        country: 'Россия',
        description: 'Лидер рынка онлайн-записи для салонов красоты и медицины',
        features: 'Онлайн-запись, CRM, склад, бухгалтерия, виджеты, мессенджеры',
        pricing: 'от 990₽/мес',
        targetAudience: 'Салоны красоты, клиники, образовательные центры',
        strengths: ['Полный функционал', 'Интеграции', 'Бесплатный тариф', 'Мобильное приложение'],
        weaknesses: ['Сложность интерфейса', 'Цена расширенных функций', 'Перегруженность'],
        opportunities: ['AI-ассистент', 'Интеграция с маркетплейсами', 'Видео-консультации'],
        threats: ['Dikidi', 'Нишевые решения', 'Собственные разработки'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      },
      {
        name: 'Dikidi',
        url: 'https://dikidi.net',
        country: 'Россия',
        description: 'Простой сервис онлайн-записи с современным интерфейсом',
        features: 'Онлайн-запись, расписание, уведомления, CRM, виджеты',
        pricing: 'от 490₽/мес',
        targetAudience: 'Мастера, маленькие салоны',
        strengths: ['Простота', 'Дизайн', 'Цена', 'Быстрый старт'],
        weaknesses: ['Ограниченный функционал', 'Меньше интеграций', 'Нет склада'],
        opportunities: ['Расширение функций', 'Бизнес-аналитика', 'Галерея работ'],
        threats: ['YCLIENTS', 'Бесплатные альтернативы'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      },
      {
        name: 'Sonline',
        url: 'https://sonline.su',
        country: 'Россия',
        description: 'Сервис онлайн-записи для салонов и клиник',
        features: 'Онлайн-запись, расписание, SMS-уведомления, отчёты',
        pricing: 'от 290₽/мес',
        targetAudience: 'Салоны красоты, медицинские центры',
        strengths: ['Низкая цена', 'Простота', 'SMS включены'],
        weaknesses: ['Базовый функционал', 'Мало интеграций'],
        opportunities: ['Интеграции', 'AI-функции', 'Расширение'],
        threats: ['Крупные конкуренты', 'Ценовая война'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐'
      }
    ],
    indirect: [
      {
        name: 'WhatsApp / Telegram',
        description: 'Мессенджеры для записи через личные сообщения',
        approach: 'Переписка с мастером/салоном',
        overlap: 'Коммуникация для записи',
        differentiation: 'Нет автоматизации, календаря, напоминаний'
      },
      {
        name: 'Google Calendar',
        description: 'Календарь для ручного управления записями',
        approach: 'Ручное ведение расписания',
        overlap: 'Управление временем',
        differentiation: 'Нет клиентской части, онлайн-записи'
      },
      {
        name: 'Телефонная запись',
        description: 'Традиционный способ записи по телефону',
        approach: 'Звонок в салон/клинику',
        overlap: 'Запись на услугу',
        differentiation: 'Требует времени, нет напоминаний'
      }
    ]
  },
  ats: {
    direct: [
      {
        name: 'Манго Офис',
        url: 'https://mango-office.ru',
        country: 'Россия',
        description: 'Облачная АТС с интеграцией CRM и аналитикой звонков',
        features: 'Виртуальная АТС, интеграция CRM, запись звонков, IVR, аналитика',
        pricing: 'от 650₽/мес за пользователя',
        targetAudience: 'Малый и средний бизнес в РФ',
        strengths: ['Локализация для РФ', 'Интеграция с российскими CRM', 'Техподдержка на русском', 'Работа с российскими операторами'],
        weaknesses: ['Ограниченный функционал аналитики', 'Устаревший интерфейс', 'Сложность настройки интеграций'],
        opportunities: ['Расширение AI-функций', 'Мобильное приложение', 'Интеграция с мессенджерами'],
        threats: ['Выход на рынок зарубежных игроков', 'Снижение цен конкурентами', 'Изменения в законодательстве'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      },
      {
        name: 'Telphin',
        url: 'https://telphin.ru',
        country: 'Россия',
        description: 'IP-телефония и виртуальная АТС для бизнеса',
        features: 'Виртуальная АТС, SIP-телефония, интеграция с 1С, запись разговоров',
        pricing: 'от 290₽/мес',
        targetAudience: 'Малый бизнес, колл-центры',
        strengths: ['Низкая цена', 'Простота настройки', 'Интеграция с 1С'],
        weaknesses: ['Базовый функционал', 'Ограниченная аналитика', 'Старый UI'],
        opportunities: ['Обновление интерфейса', 'AI-функции', 'Мобильное приложение'],
        threats: ['Более технологичные конкуренты', 'Ценовая война'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐⭐',
        uxScore: '⭐⭐',
        supportScore: '⭐⭐⭐'
      },
      {
        name: 'UIS (Юждес)',
        url: 'https://uiscom.ru',
        country: 'Россия',
        description: 'Облачная контакт-центр и виртуальная АТС',
        features: 'Виртуальная АТС, контакт-центр, интеграция CRM, аналитика',
        pricing: 'от 600₽/мес',
        targetAudience: 'Средний и крупный бизнес',
        strengths: ['Мощный контакт-центр', 'Глубокая аналитика', 'Интеграции'],
        weaknesses: ['Сложность для новичков', 'Высокая цена расширенных функций', 'Долгое внедрение'],
        opportunities: ['SMB-сегмент', 'AI-ассистенты', 'Самостоятельная настройка'],
        threats: ['Упрощение решений конкурентами', 'Экономический фактор'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      }
    ],
    indirect: [
      {
        name: 'Telegram',
        description: 'Мессенджер с функциями звонков и групповых чатов',
        approach: 'Бесплатная связь через интернет',
        overlap: 'Групповые звонки, контакты',
        differentiation: 'Не бизнес-ориентирован, нет CRM-интеграций'
      },
      {
        name: 'WhatsApp Business',
        description: 'Бизнес-версия мессенджера для общения с клиентами',
        approach: 'Чат-коммуникация с клиентами',
        overlap: 'Клиентское общение',
        differentiation: 'Только чат, нет телефонии'
      },
      {
        name: 'Skype',
        description: 'Платформа для видеозвонков и чатов',
        approach: 'Видеоконференции и звонки',
        overlap: 'Звонки, конференц-связь',
        differentiation: 'Устаревший продукт, нет бизнес-функций АТС'
      }
    ]
  },
  dashboard: {
    direct: [
      {
        name: 'Yandex DataLens',
        url: 'https://cloud.yandex.ru/services/datalens',
        country: 'Россия',
        description: 'Бесплатный BI-сервис для визуализации данных',
        features: 'Дашборды, визуализации, интеграция с Yandex Cloud, collaborative редактирование',
        pricing: 'Бесплатно',
        targetAudience: 'Компании любого размера',
        strengths: ['Бесплатность', 'Интеграция с Yandex', 'Простота', 'Русский язык'],
        weaknesses: ['Ограниченная кастомизация', 'Зависимость от Yandex', 'Ограниченные источники данных'],
        opportunities: ['Расширение источников', 'AI-инсайты', 'Мобильное приложение'],
        threats: ['Изменение тарифной политики', 'Выход международных игроков'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐'
      },
      {
        name: 'Grafana',
        url: 'https://grafana.com',
        country: 'США',
        description: 'Open-source платформа для визуализации и мониторинга',
        features: 'Гибкие дашборды, алертинг, множество плагинов, open source',
        pricing: 'Open source / Enterprise от $50/мес',
        targetAudience: 'IT-команды, DevOps',
        strengths: ['Гибкость', 'Open source', 'Community', 'Plugin ecosystem'],
        weaknesses: ['Сложность настройки', 'Требует технических знаний', 'Нет русского языка'],
        opportunities: ['Упрощение для бизнеса', 'SaaS-версия', 'No-code редактор'],
        threats: ['Cloud-native решения', 'Встроенные дашборды в других продуктах'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐'
      },
      {
        name: 'Tableau',
        url: 'https://tableau.com',
        country: 'США',
        description: 'Лидер рынка BI с мощной визуализацией',
        features: 'Расширенная визуализация, AI-инсайты, data prep, collaboration',
        pricing: 'от $15/мес за пользователя',
        targetAudience: 'Средний и крупный бизнес',
        strengths: ['Мощный функционал', 'Лидер рынка', 'AI-возможности', 'Интеграции'],
        weaknesses: ['Высокая цена', 'Сложность обучения', 'Нет локализации'],
        opportunities: ['SMB-сегмент', 'Локализация', 'Упрощение'],
        threats: ['Бесплатные альтернативы', 'Российские решения'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐',
        uxScore: '⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      }
    ],
    indirect: [
      {
        name: 'Google Sheets',
        description: 'Табличный процессор с визуализацией',
        approach: 'Самостоятельное создание отчётов',
        overlap: 'Визуализация данных, совместная работа',
        differentiation: 'Нет real-time дашбордов, ограниченная визуализация'
      },
      {
        name: 'Excel / Power BI',
        description: 'Майкрософт экосистема для работы с данными',
        approach: 'Интеграция с Office 365',
        overlap: 'Отчёты, визуализация',
        differentiation: 'Сложность, цена, привязка к Microsoft'
      },
      {
        name: 'Notion',
        description: 'All-in-one workspace с базами данных',
        approach: 'Самостоятельное ведение базы',
        overlap: 'Структурирование данных',
        differentiation: 'Нет продвинутой аналитики, дашборды ограничены'
      }
    ]
  },
  crm: {
    direct: [
      {
        name: 'Битрикс24',
        url: 'https://bitrix24.ru',
        country: 'Россия',
        description: 'Комплексная CRM с функциями управления проектами',
        features: 'CRM, задачи, коммуникации, сайт, интернет-магазин',
        pricing: 'Бесплатно до 5 пользователей / от 2490₽/мес',
        targetAudience: 'Малый и средний бизнес',
        strengths: ['Бесплатный тариф', 'Всё в одном', 'Локализация', 'Интеграции'],
        weaknesses: ['Перегруженность', 'Сложность', 'Скорость работы'],
        opportunities: ['Упрощение интерфейса', 'AI-функции', 'Мобильность'],
        threats: ['Конкуренция с нишевыми решениями', 'Отток пользователей'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐⭐',
        uxScore: '⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      },
      {
        name: 'AmoCRM',
        url: 'https://amocrm.ru',
        country: 'Россия',
        description: 'Простая CRM для управления продажами',
        features: 'Воронка продаж, интеграции, автоматизация, аналитика',
        pricing: 'от 799₽/мес',
        targetAudience: 'Малый бизнес, отделы продаж',
        strengths: ['Простота', 'Воронка продаж', 'Интуитивность', 'Интеграции'],
        weaknesses: ['Ограниченный функционал', 'Нет задач/проектов', 'Цена растёт с пользователями'],
        opportunities: ['Расширение функционала', 'AI-рекомендации', 'Мобильность'],
        threats: ['Битрикс24', 'Зарубежные решения', 'Ценовая конкуренция'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      },
      {
        name: 'Salesforce',
        url: 'https://salesforce.com',
        country: 'США',
        description: 'Мировой лидер CRM для крупного бизнеса',
        features: 'Sales Cloud, Service Cloud, Marketing Cloud, AI Einstein',
        pricing: 'от $25/мес за пользователя',
        targetAudience: 'Средний и крупный бизнес',
        strengths: ['Мощный функционал', 'Экосистема', 'AI', 'Интеграции'],
        weaknesses: ['Высокая цена', 'Сложность', 'Нет русского языка', 'Санкции'],
        opportunities: ['Российский рынок', 'SMB сегмент', 'Упрощение'],
        threats: ['Российские решения', 'Санкции', 'Цена'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      }
    ],
    indirect: [
      {
        name: 'Google Contacts',
        description: 'Адресная книга Google',
        approach: 'Хранение контактов',
        overlap: 'Хранение контактов',
        differentiation: 'Нет функций продаж, нет воронки'
      },
      {
        name: 'Trello',
        description: 'Kanban-доска для управления задачами',
        approach: 'Визуальное управление',
        overlap: 'Управление процессами',
        differentiation: 'Нет CRM-функций, нет продаж'
      },
      {
        name: 'Excel / Google Sheets',
        description: 'Табличные процессоры',
        approach: 'Самостоятельное ведение базы клиентов',
        overlap: 'Хранение данных о клиентах',
        differentiation: 'Нет автоматизации, нет воронки продаж'
      }
    ]
  }
};

// Функция определения типа продукта
function detectProductType(text: string): ProductType {
  const lowerText = text.toLowerCase();
  
  // Ищем наиболее подходящий тип продукта
  let bestMatch: ProductType | null = null;
  let bestScore = 0;
  
  for (const type of PRODUCT_TYPES) {
    let score = 0;
    for (const keyword of type.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += keyword.length; // Более длинные ключевые слова более специфичны
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = type;
    }
  }
  
  // Если ничего не найдено, возвращаем тип по умолчанию
  if (!bestMatch) {
    return {
      id: 'default',
      name: 'Программный продукт / SaaS',
      keywords: [],
      marketSize: 'Зависит от конкретной ниши',
      trends: ['AI-интеграция', 'Облачные решения', 'Мобильность', 'Персонализация'],
      barriers: ['Конкуренция', 'Привлечение пользователей', 'Монетизация'],
      positioning: 'современное решение для цифровых потребностей'
    };
  }
  
  return bestMatch;
}

// Функция генерации конкурентов
function generateCompetitors(productType: ProductType, idea: { name: string; description: string; functions: string[] }): { direct: Competitor[]; indirect: IndirectCompetitor[] } {
  // Проверяем есть ли готовая база для этого типа
  if (COMPETITORS_DB[productType.id]) {
    return COMPETITORS_DB[productType.id];
  }
  
  // Если нет готовой базы, генерируем общих конкурентов
  return {
    direct: [
      {
        name: 'Лидер рынка',
        url: 'https://example.com',
        country: 'США/Европа',
        description: 'Ведущий игрок в нише с широким функционалом',
        features: 'Полный набор функций, интеграции, API',
        pricing: 'От $50-200/мес',
        targetAudience: 'Средний и крупный бизнес',
        strengths: ['Бренд', 'Функциональность', 'Надёжность', 'Поддержка'],
        weaknesses: ['Цена', 'Сложность', 'Нет локализации', 'Долгое внедрение'],
        opportunities: ['Выход на новые рынки', 'SMB-сегмент', 'AI-функции'],
        threats: ['Новые игроки', 'Open source альтернативы', 'Экономический фактор'],
        functionalityScore: '⭐⭐⭐⭐⭐',
        priceScore: '⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      },
      {
        name: 'Российский аналог',
        url: 'https://example.ru',
        country: 'Россия',
        description: 'Локальное решение с адаптацией под рынок РФ',
        features: 'Базовый функционал, интеграция с российскими сервисами',
        pricing: 'От 1000-5000₽/мес',
        targetAudience: 'Российский бизнес',
        strengths: ['Локализация', 'Поддержка на русском', 'Интеграции', 'Цена'],
        weaknesses: ['Ограниченный функционал', 'Масштабируемость', 'Технологии'],
        opportunities: ['Развитие функций', 'AI', 'Мобильность'],
        threats: ['Зарубежные решения', 'Кадры', 'Технологии'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐',
        supportScore: '⭐⭐⭐⭐'
      },
      {
        name: 'Start-up конкурент',
        url: 'https://startup.example.com',
        country: 'Интернациональный',
        description: 'Молодой проект с инновационным подходом',
        features: 'Современный UI, AI-функции, быстрый старт',
        pricing: 'Freemium / от $10-30/мес',
        targetAudience: 'Стартапы, малый бизнес',
        strengths: ['Инновации', 'Современный UI', 'Гибкость', 'Цена'],
        weaknesses: ['Надёжность', 'Ограниченный функционал', 'Поддержка', 'Документация'],
        opportunities: ['Развитие', 'Инвестиции', 'Партнёрства'],
        threats: ['Большие игроки', 'Финансирование', 'Команда'],
        functionalityScore: '⭐⭐⭐',
        priceScore: '⭐⭐⭐⭐⭐',
        uxScore: '⭐⭐⭐⭐⭐',
        supportScore: '⭐⭐'
      }
    ],
    indirect: [
      {
        name: 'Excel / Google Sheets',
        description: 'Табличные процессоры для самостоятельного учёта',
        approach: 'Самостоятельное создание системы',
        overlap: 'Хранение и обработка данных',
        differentiation: 'Нет автоматизации, требует ручной работы'
      },
      {
        name: 'Notion',
        description: 'All-in-one workspace',
        approach: 'Гибкое структурирование информации',
        overlap: 'Управление данными и процессами',
        differentiation: 'Нет специализации под конкретную задачу'
      },
      {
        name: 'Ручное управление / Legacy-системы',
        description: 'Старые методы и системы',
        approach: 'Традиционные процессы',
        overlap: 'Решение проблемы',
        differentiation: 'Низкая эффективность, несовременность'
      }
    ]
  };
}

function getFallbackResponse(agentType: string, message: string): string {
  const idea = extractFormedIdea(message);
  const lowerMessage = message.toLowerCase();
  
  // === АНАЛИТИК ИДЕЙ ===
  if (agentType === 'transcription_analyst') {
    // Извлекаем исходный текст пользователя
    let sourceText = '';
    
    // Паттерн 1: После "Исходный текст:"
    const sourceMatch = message.match(/Исходный текст:\s*([\s\S]*)$/i);
    if (sourceMatch && sourceMatch[1]) {
      sourceText = sourceMatch[1].trim();
    }
    
    // Паттерн 2: Последний существенный абзац
    if (!sourceText || sourceText.length < 20) {
      const paragraphs = message.split(/\n\n+/).filter(p => p.trim().length > 20);
      if (paragraphs.length > 0) {
        // Берём последний абзац который выглядит как описание
        for (let i = paragraphs.length - 1; i >= 0; i--) {
          if (!paragraphs[i].includes('Проанализируй') && 
              !paragraphs[i].includes('Структура ответа') &&
              !paragraphs[i].startsWith('##')) {
            sourceText = paragraphs[i].trim();
            break;
          }
        }
      }
    }
    
    // Паттерн 3: Весь текст если ничего не найдено
    if (!sourceText || sourceText.length < 20) {
      sourceText = message.trim();
    }
    
    console.log(`[Fallback transcription_analyst] sourceText: "${sourceText.substring(0, 200)}..."`);
    
    // Анализируем исходный текст и генерируем конкретную идею
    const analysis = analyzeSourceIdea(sourceText);
    
    return `## 💡 Название идеи
**${analysis.name}**

### Описание сути
${analysis.description}

### Use Cases (Сценарии использования)
${analysis.useCases.map((u, i) => `${i + 1}. ${u}`).join('\n')}

### Целевая аудитория и типы пользователей
${analysis.userTypes}

### Ключевая ценность (Value Proposition)
${analysis.valueProposition}

### Основные функции
${analysis.functions.map((f, i) => `${i + 1}. ${f}`).join('\n')}

### Риски реализации (взгляд маркетолога-критика)
${analysis.risks.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### Трудности реализации
${analysis.difficulties.map((d, i) => `${i + 1}. ${d}`).join('\n')}

### Рекомендации по оптимизации идеи
**Улучшение ценности:**
${analysis.valueImprovements.map((v, i) => `${i + 1}. ${v}`).join('\n')}

**Дифференциация:**
${analysis.differentiationStrategy}

### Итоговая оценка
${analysis.finalScore}`;
  }

// === ФУНКЦИЯ АНАЛИЗА ИДЕИ ===
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
  const lowerText = sourceText.toLowerCase();
  
  // === ОПРЕДЕЛЯЕМ ТИП ПРОДУКТА ПО КОНТЕКСТУ ===
  let productType = 'general';
  let productKeywords: string[] = [];
  let specificNiche = '';
  
  // Онлайн-запись / Календарь записи
  if ((lowerText.includes('запис') && (lowerText.includes('календар') || lowerText.includes('расписан') || lowerText.includes('слот') || lowerText.includes('приём'))) ||
      lowerText.includes('онлайн запис') || lowerText.includes('запись к') || lowerText.includes('запись на приём') ||
      lowerText.includes('бронирование времени') || lowerText.includes('yclients') || lowerText.includes('dikidi')) {
    productType = 'booking';
    productKeywords = ['онлайн-запись', 'календарь', 'расписание', 'бронирование'];
    // Определяем конкретную нишу
    if (lowerText.includes('логопед')) { specificNiche = 'логопеды'; productKeywords.push('дефектология'); }
    else if (lowerText.includes('психолог')) { specificNiche = 'психологи'; productKeywords.push('консультации'); }
    else if (lowerText.includes('врач') || lowerText.includes('клиник')) { specificNiche = 'медицина'; productKeywords.push('здравоохранение'); }
    else if (lowerText.includes('салон') || lowerText.includes('красот')) { specificNiche = 'салоны красоты'; productKeywords.push('бьюти-сфера'); }
    else if (lowerText.includes('репетитор') || lowerText.includes('учител')) { specificNiche = 'образование'; productKeywords.push('репетиторство'); }
  }
  // АТС / Телефония
  else if ((lowerText.includes('атс') || lowerText.includes('телефони')) && 
           (lowerText.includes('звонок') || lowerText.includes('ivr') || lowerText.includes('sip') || lowerText.includes('call'))) {
    productType = 'ats';
    productKeywords = ['телефония', 'звонки', 'АТС', 'коммуникации'];
  }
  // Дашборд / Аналитика
  else if ((lowerText.includes('дашборд') || lowerText.includes('аналитик') || lowerText.includes('метрик') || 
            lowerText.includes('отчёт') || lowerText.includes('kpi')) &&
           (lowerText.includes('данн') || lowerText.includes('график') || lowerText.includes('визуализац') || lowerText.includes('виджет'))) {
    productType = 'dashboard';
    productKeywords = ['аналитика', 'визуализация', 'дашборд', 'данные'];
  }
  // CRM
  else if (lowerText.includes('crm') || 
           (lowerText.includes('клиент') && lowerText.includes('продаж')) ||
           (lowerText.includes('сделк') && lowerText.includes('воронк'))) {
    productType = 'crm';
    productKeywords = ['клиенты', 'продажи', 'CRM', 'сделки'];
  }
  // E-commerce
  else if (lowerText.includes('маркетплейс') || lowerText.includes('торговая площадка') ||
           (lowerText.includes('магазин') && (lowerText.includes('товар') || lowerText.includes('заказ') || lowerText.includes('корзин')))) {
    productType = 'ecommerce';
    productKeywords = ['торговля', 'заказы', 'магазин', 'продажи'];
  }
  // Мессенджер
  else if (lowerText.includes('мессендж') || lowerText.includes('чат-приложение') ||
           (lowerText.includes('чат') && lowerText.includes('сообщен'))) {
    productType = 'messenger';
    productKeywords = ['общение', 'сообщения', 'чат', 'коммуникация'];
  }
  // Такси / Транспорт
  else if (lowerText.includes('такси') || lowerText.includes('taxi') || 
           lowerText.includes('попутн') || lowerText.includes('каршеринг')) {
    productType = 'taxi';
    productKeywords = ['такси', 'транспорт', 'поездки'];
  }
  // Доставка / Логистика
  else if (lowerText.includes('доставк') || lowerText.includes('логистик') || lowerText.includes('грузоперевозк')) {
    productType = 'logistics';
    productKeywords = ['доставка', 'логистика', 'грузоперевозки'];
  }

  // === ИЗВЛЕКАЕМ ДАННЫЕ ИЗ ИСХОДНОГО ТЕКСТА ===
  
  // Название продукта
  let name = '';
  const nameMatch = sourceText.match(/(?:названи[еи]|продукт|проект|сервис|приложение|платформа)[^:]*[:«"]?\s*([А-Яа-яA-Za-z0-9\s]{2,50})["»]?/i);
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].trim().replace(/^["«»]+|["«»]+$/g, '');
  }
  if (!name || name.length < 3) {
    // Генерируем название на основе типа и ниши
    const nameGenerators: Record<string, () => string> = {
      booking: () => specificNiche ? `Сервис записи для ${specificNiche}` : 'Сервис онлайн-записи',
      ats: () => 'Облачная АТС',
      dashboard: () => 'Бизнес-дашборд',
      crm: () => 'CRM-платформа',
      ecommerce: () => 'E-commerce платформа',
      messenger: () => 'Мессенджер',
      taxi: () => 'Такси-сервис',
      logistics: () => 'Платформа логистики',
      general: () => sourceText.split(/\s+/).slice(0, 3).join(' ') || 'Новый продукт'
    };
    name = (nameGenerators[productType] || nameGenerators.general)();
  }

  // Описание - извлекаем из текста
  let description = sourceText
    .replace(/^(название|продукт|проект)[^:]*:?\s*/i, '')
    .replace(/(?:нужно|необходимо|требуется|хочу|сделать|создать|разработать)\s*/gi, '')
    .trim()
    .substring(0, 300);
  
  if (description.length < 50) {
    const contextAdditions: Record<string, string> = {
      booking: ` — сервис для автоматизации записи клиентов${specificNiche ? ` в сфере ${specificNiche}` : ''}.`,
      ats: ' — облачное решение для бизнес-телефонии.',
      dashboard: ' — платформа для визуализации бизнес-данных.',
      crm: ' — система управления клиентами и продажами.',
      general: ' — инновационное решение для цифровизации процессов.'
    };
    description += contextAdditions[productType] || contextAdditions.general;
  }

  // Use Cases - извлекаем из текста или генерируем на основе типа
  const useCases: string[] = [];
  
  // Пытаемся найти сценарии в тексте
  const scenarioPatterns = [
    /(?:сценарий|вариант использования|use ?case)[^:]*:?\s*([^\n.]+[^\n]*)/gi,
    /(?:когда|если|пользователь)[^,]*,\s*([^\n.]+)/gi
  ];
  
  for (const pattern of scenarioPatterns) {
    const matches = sourceText.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 10) {
        useCases.push(match[1].trim());
      }
    }
  }
  
  // Если сценариев мало, добавляем типовые на основе продукта
  if (useCases.length < 3) {
    const defaultUseCases: Record<string, string[]> = {
      booking: [
        `Клиент находит свободный слот и записывается онлайн за 30 секунд`,
        `Специалист видит расписание на день и получает уведомления о новых записях`,
        `Администратор управляет расписанием нескольких специалистов одновременно`
      ],
      ats: [
        `Сотрудник принимает звонок клиента через мобильное приложение`,
        `Руководитель прослушивает записи разговоров для контроля качества`,
        `Менеджер анализирует статистику звонков в дашборде`
      ],
      dashboard: [
        `Руководитель видит ключевые метрики бизнеса на одном экране`,
        `Аналитик создаёт кастомный отчёт за 5 минут без IT-помощи`,
        `Менеджер получает алерт при падении конверсии`
      ],
      crm: [
        `Менеджер ведёт сделку от первого контакта до закрытия`,
        `Руководитель видит воронку продаж и прогноз выручки`,
        `Система напоминает о задачах и повторных контактах`
      ],
      general: [
        `Пользователь выполняет основную задачу за минимальное количество шагов`,
        `Администратор управляет настройками системы`,
        `Менеджер получает аналитику и отчёты`
      ]
    };
    const cases = defaultUseCases[productType] || defaultUseCases.general;
    useCases.push(...cases.filter(c => useCases.length < 5));
  }

  // Типы пользователей
  let userTypes = '';
  
  // Извлекаем из текста
  const userMatch = sourceText.match(/(?:пользовател[иь]|роль|тип[ыы]? пользовател)[^:]*:?\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\n|\n###|$)/i);
  if (userMatch && userMatch[1] && userMatch[1].length > 20) {
    userTypes = userMatch[1].trim();
  } else {
    // Генерируем на основе типа продукта
    const userTypeGenerators: Record<string, () => string> = {
      booking: () => {
        if (specificNiche === 'логопеды') return '**Пациенты/Родители** — ищут специалиста, выбирают удобное время, записываются на приём.\n**Логопеды** — ведут расписание, видят записи пациентов, ведут карточки.\n**Администратор** — управляет расписанием клиники, отчёты.';
        if (specificNiche === 'психологи') return '**Клиенты** — находят психолога, бронируют сессию, оплачивают онлайн.\n**Психологи** — управляют календарём, ведут заметки по клиентам.\n**Администратор** — координация, биллинг.';
        return '**Клиенты** — записываются онлайн, получают напоминания, оплачивают услуги.\n**Специалисты** — ведут расписание, карточки клиентов.\n**Администратор** — управление расписанием, аналитика.';
      },
      ats: () => '**Операторы** — принимают и совершают звонки, видят историю клиента.\n**Руководители** — аналитика, прослушивание записей, контроль качества.\n**Администратор** — настройка IVR, маршрутизации, интеграций.',
      dashboard: () => '**Бизнес-пользователи** — просмотр дашбордов, создание отчётов без кода.\n**Аналитики** — настройка источников данных, создание сложных визуализаций.\n**Администратор** — управление доступами, источниками данных.',
      crm: () => '**Менеджеры по продажам** — ведение сделок, контакты, задачи.\n**Руководитель продаж** — воронка, прогнозы, контроль команды.\n**Маркетолог** — лиды, кампании, интеграции.',
      general: () => '**Пользователи** — выполнение основных функций продукта.\n**Менеджеры** — управление процессами, аналитика.\n**Администратор** — настройки, доступы, интеграции.'
    };
    userTypes = (userTypeGenerators[productType] || userTypeGenerators.general)();
  }

  // Ценностное предложение - извлекаем из текста
  let valueProposition = '';
  const valueMatch = sourceText.match(/(?:ценност[ьи]|value|преимуществ[ао]|выгод)[^:]*:?\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\n|\n###|$)/i);
  if (valueMatch && valueMatch[1] && valueMatch[1].length > 15) {
    valueProposition = valueMatch[1].trim();
  } else {
    const valueProps: Record<string, string> = {
      booking: specificNiche ? 
        `Автоматизация записи для ${specificNiche}: снижение неявок на 70% через напоминания, заполнение слотов на 85%, экономия времени администратора.` :
        `Сокращение времени записи с 5 минут до 30 секунд. Напоминания снижают неявки на 70%. Интеграция с календарями и мессенджерами.`,
      ats: 'Настройка за 15 минут без IT-специалиста. Экономия на телефонии до 40%. Аналитика всех звонков.',
      dashboard: 'Все метрики на одном экране. Решения на основе данных. Автоматические отчёты и алерты.',
      crm: 'Рост продаж на 30% через систематизацию. Автоматизация рутины. Прогнозирование сделок.',
      general: 'Экономия времени на рутине. Интуитивный интерфейс. Быстрая окупаемость инвестиций.'
    };
    valueProposition = valueProps[productType] || valueProps.general;
  }

  // Функции - извлекаем из текста
  const functions: string[] = [];
  const funcMatch = sourceText.match(/(?:функци[ия]|возможност[ьи]|может|умеет)[^:]*:?\s*([\s\S]*?)(?=\n\n|\n###|$)/i);
  if (funcMatch && funcMatch[1]) {
    const funcLines = funcMatch[1].split(/[\n•\-\d.]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 10);
    functions.push(...funcLines.slice(0, 6));
  }
  
  if (functions.length < 3) {
    const funcSets: Record<string, string[]> = {
      booking: [
        'Онлайн-календарь с визуализацией свободных слотов',
        'Автоматические SMS/Email напоминания за 24 часа и 2 часа',
        'Карточки клиентов с историей визитов',
        'Приём онлайн-оплат и предоплат',
        'Интеграция с Google Calendar, Яндекс.Календарь',
        'Виджет записи для сайта и соцсетей'
      ],
      ats: [
        'Многоканальный номер с IVR-меню',
        'Запись и транскрибация звонков',
        'Интеграция с CRM-системами',
        'Аналитика звонков по операторам',
        'Мобильное приложение для сотрудников',
        'Омниканальность: телефония + чаты'
      ],
      dashboard: [
        'Конструктор дашбордов drag-and-drop',
        'Real-time обновление данных',
        'Интеграция с источниками данных',
        'Автоматические отчёты и алерты',
        'Совместная работа и шеринг',
        'Мобильная версия'
      ],
      crm: [
        'Воронка продаж с этапами',
        'Контакт-профили с историей',
        'Автоматизация задач и напоминаний',
        'Email/WhatsApp интеграции',
        'Аналитика и прогнозирование',
        'Мобильное приложение'
      ],
      general: [
        'Управление основными процессами',
        'Аналитика и отчётность',
        'Интеграции с сервисами',
        'Уведомления и алерты',
        'Мобильное приложение',
        'Ролевая модель доступа'
      ]
    };
    const funcs = funcSets[productType] || funcSets.general;
    functions.push(...funcs.filter(f => functions.length < 6));
  }

  // Риски - генерируем на основе КОНКРЕТНОГО контекста продукта
  const risks: string[] = [];
  
  const riskGenerators: Record<string, () => string[]> = {
    booking: () => {
      const r = [];
      if (specificNiche) {
        r.push(`Конкуренция с универсальными сервисами (YCLIENTS, Dikidi) — дифференциация через специализацию на ${specificNiche}`);
      } else {
        r.push('Конкуренция с YCLIENTS и Dikidi — нужен нишевой фокус или уникальная фича');
      }
      r.push('Привычка записываться по телефону — нужна мотивация переходить на онлайн');
      r.push('Зависимость от SMS-провайдеров — стоимость напоминаний растёт');
      return r;
    },
    ats: () => [
      'Конкуренция с Манго Офис, UIS, Telphin — нужен фокус на нише или простоте',
      'Зависимость от телефонных операторов — диверсификация каналов',
      'Изменения в законодательстве о связи — постоянный мониторинг'
    ],
    dashboard: () => [
      'Конкуренция с бесплатным Yandex DataLens — нужны уникальные интеграции',
      'Качество данных от клиентов — нужна валидация на входе',
      'Сопротивление изменениям — нужно обучение и демонстрация ценности'
    ],
    crm: () => [
      'Конкуренция с Битрикс24, AmoCRM — нужен фокус на конкретной нише',
      'Сложность миграции с других систем — нужен простой импорт',
      'Кривая обучения — интерфейс должен быть проще конкурентов'
    ],
    general: () => [
      'Выход крупных конкурентов в нишу — нужна дифференциация',
      'Сложность привлечения первых пользователей — каналы дистрибуции',
      'Трудности с монетизацией — тестирование моделей'
    ]
  };
  risks.push(...(riskGenerators[productType] || riskGenerators.general)());

  // Трудности реализации - КОНКРЕТНЫЕ на основе продукта
  const difficulties: string[] = [];
  
  const difficultyGenerators: Record<string, () => string[]> = {
    booking: () => [
      'Интеграция с календарями специалистов (Google, Яндекс, Outlook) — разные API',
      'Синхронизация расписания при офлайн-записях — нужна двусторонняя связь',
      'Доставка SMS-напоминаний — блокировки и спам-фильтры'
    ],
    ats: () => [
      'Интеграция с российскими операторами связи — бюрократия',
      'Стабильность телефонии при пиковых нагрузках — масштабирование',
      'Интеграция с разными CRM — разные API и модели данных'
    ],
    dashboard: () => [
      'Подключение множества источников данных — разные форматы',
      'Real-time обновления без нагрузки на систему — оптимизация',
      'Производительность при больших объёмах данных — кэширование'
    ],
    crm: () => [
      'Импорт данных из других CRM — разные структуры данных',
      'Мобильное приложение с офлайн-режимом — синхронизация',
      'Интеграция с email и мессенджерами — разные API'
    ],
    general: () => [
      'Техническая сложность ключевых функций',
      'Интеграции с внешними сервисами',
      'Масштабирование при росте пользователей'
    ]
  };
  difficulties.push(...(difficultyGenerators[productType] || difficultyGenerators.general)());

  // Улучшение ценности - КОНКРЕТНЫЕ предложения на основе анализа
  const valueImprovements: string[] = [];
  
  const valueImprovementGenerators: Record<string, () => string[]> = {
    booking: () => {
      const improvements = [];
      if (specificNiche === 'логопеды') {
        improvements.push('Добавить хранение материалов занятий и прогресса пациента — логопеды ведут записи');
        improvements.push('Интеграция с порталами дефектологов для автоматического заполнения документов');
        improvements.push('Видео-консультации для удалённых занятий — актуально после пандемии');
      } else if (specificNiche === 'психологи') {
        improvements.push('Безопасное хранение заметок сессий с шифрованием — конфиденциальность критична');
        improvements.push('Анонимный подбор психолога по запросу клиента');
        improvements.push('Видео-сессии встроенные в платформу');
      } else {
        improvements.push('Автоподбор оптимального времени для регулярных клиентов');
        improvements.push('Интеграция с Instagram/WhatsApp для записи из соцсетей');
        improvements.push('Программа лояльности и скидки для постоянных клиентов');
      }
      improvements.push('Двусторонняя синхронизация с календарями специалистов');
      return improvements.slice(0, 4);
    },
    ats: () => [
      'AI-транскрибация и анализ эмоций в звонках',
      'Интеграция с чат-ботами для первичной обработки',
      'Автоматическое распределение звонков по компетенциям сотрудников'
    ],
    dashboard: () => [
      'AI-инсайты: автоматическое выявление аномалий и трендов',
      'Голосовые запросы к данным через ассистента',
      'Прогнозирование на основе исторических данных'
    ],
    crm: () => [
      'AI-скоринг лидов: предсказание вероятности закрытия',
      'Автоматические follow-up последовательности',
      'Интеграция с рекламными кабинетами для сквозной аналитики'
    ],
    general: () => [
      'Персонализация интерфейса под роль пользователя',
      'Автоматизация рутинных операций через AI',
      'Мобильная версия с полным функционалом'
    ]
  };
  valueImprovements.push(...(valueImprovementGenerators[productType] || valueImprovementGenerators.general)());

  // Стратегия дифференциации - КОНКРЕТНАЯ на основе анализа конкурентов
  let differentiationStrategy = '';
  
  const diffGenerators: Record<string, () => string> = {
    booking: () => {
      if (specificNiche) {
        return `**Уникальное преимущество:** Специализация на ${specificNiche} — отраслевые функции, которых нет у универсальных конкурентов (YCLIENTS, Dikidi). В отличие от них: понимание специфики работы ${specificNiche}, встроенные шаблоны документов, отраслевая аналитика. Целевое позиционирование: "Сервис записи для ${specificNiche}, созданный специалистами этой сферы".`;
      }
      return `**Уникальное преимущество:** Простота и скорость — запись за 30 секунд против 2-3 минут у конкурентов. Интеграция с российскими мессенджерами (WhatsApp, Telegram) для коммуникации. В отличие от YCLIENTS (сложный, перегруженный) и Dikidi (ограниченный функционал) — баланс между функциональностью и простотой.`;
    },
    ats: () => '**Уникальное преимущество:** Российская разработка с фокусом на малый бизнес — настройка за 15 минут без IT-специалиста. В отличие от Манго Офис (сложный, дорогой) и UIS (enterprise-ориентированный) — простота для небольших команд. Локальная техподдержка в часовом поясе клиента.',
    dashboard: () => '**Уникальное преимущество:** Бесплатный старт без ограничений, в отличие от Tableau (дорого) и Power BI (требует Microsoft). No-code подход — аналитика доступна бизнес-пользователям. Готовые шаблоны для типовых задач: продажи, маркетинг, финансы.',
    crm: () => '**Уникальное преимущество:** Лучшее соотношение цена/функционал. В отличие от Битрикс24 (перегружен) и AmoCRM (только продажи) — фокус на конкретной нише с отраслевыми решениями. Быстрое внедрение за 1 день.',
    general: () => '**Уникальное преимущество:** Специализация на российском рынке — интеграции с локальными сервисами, соответствие законодательству, техподдержка на русском. Прозрачное ценообразование без скрытых платежей.'
  };
  differentiationStrategy = (diffGenerators[productType] || diffGenerators.general)();

  // Итоговая оценка
  const finalScoreGenerators: Record<string, () => string> = {
    booking: () => {
      let score = '**Потенциал идеи: 7/10**\n\n';
      score += '**Сильные стороны:** Проверенная модель бизнеса, растущий рынок онлайн-записи, возможность нишевой специализации.\n';
      score += '**Слабые стороны:** Высокая конкуренция, зависимость от стоимости SMS, сложность переключения пользователей с существующих решений.\n';
      score += '**Рекомендация:** Фокус на конкретной нише для дифференциации. Начать с MVP — календарь + онлайн-запись + напоминания. Валидировать через custdev с целевой аудиторией.';
      return score;
    },
    ats: () => '**Потенциал идеи: 6/10**\n\n**Сильные стороны:** Стабильный рынок, понятная модель монетизации, российская локализация.\n**Слабые стороны:** Высокая конкуренция, зависимость от операторов, техническая сложность.\n**Рекомендация:** Фокус на малом бизнесе и простоте настройки.',
    dashboard: () => '**Потенциал идеи: 7/10**\n\n**Сильные стороны:** Растущий спрос на data-driven решения, возможность freemium модели.\n**Слабые стороны:** Бесплатные альтернативы (Yandex DataLens), сложность подключения источников.\n**Рекомендация:** Начать с конкретной ниши (маркетинг, продажи) с готовыми шаблонами.',
    crm: () => '**Потенциал идеи: 6/10**\n\n**Сильные стороны:** Проверенная модель, понятная ценность для бизнеса.\n**Слабые стороны:** Насыщенный рынок, сложность переключения пользователей.\n**Рекомендация:** Узкая специализация по отрасли или размеру бизнеса.',
    general: () => '**Потенциал идеи: 6/10**\n\n**Сильные стороны:** Возможность занять нишу, гибкость подхода.\n**Слабые стороны:** Требуется детальная проработка уникального преимущества.\n**Рекомендация:** Провести custdev с целевой аудиторией перед разработкой MVP.'
  };
  const finalScore = (finalScoreGenerators[productType] || finalScoreGenerators.general)();

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

  // === МАРКЕТОЛОГ ===
  if (agentType === 'brand_marketer') {
    // Извлекаем контекст из Идеи
    const ideaText = message.match(/СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА[\s\S]*?(?=Предыдущий контекст|═══|===|## \d)/i)?.[0] || '';
    const lowerIdea = (idea.name + ' ' + idea.description + ' ' + idea.functions.join(' ')).toLowerCase();
    
    // Определяем ключевые слова из Идеи для поиска конкурентов
    const productKeywords: string[] = [];
    const nicheKeywords: string[] = [];
    
    // Извлекаем ключевые слова из функций
    idea.functions.forEach(f => {
      const words = f.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      productKeywords.push(...words.slice(0, 3));
    });
    
    // Определяем нишу по контексту Идеи
    if (lowerIdea.includes('запис') || lowerIdea.includes('календар') || lowerIdea.includes('брон')) {
      nicheKeywords.push('онлайн-запись', 'расписание');
      if (lowerIdea.includes('логопед')) nicheKeywords.push('логопед', 'дефектолог');
      else if (lowerIdea.includes('психолог')) nicheKeywords.push('психолог', 'терапия');
      else if (lowerIdea.includes('врач') || lowerIdea.includes('медицин')) nicheKeywords.push('медицина', 'клиника');
      else if (lowerIdea.includes('салон') || lowerIdea.includes('красот')) nicheKeywords.push('салон', 'бьюти');
      else if (lowerIdea.includes('репетитор') || lowerIdea.includes('учител')) nicheKeywords.push('образование', 'репетитор');
    } else if (lowerIdea.includes('атс') || lowerIdea.includes('телефон') || lowerIdea.includes('звонок')) {
      nicheKeywords.push('телефония', 'атс', 'звонки');
    } else if (lowerIdea.includes('дашборд') || lowerIdea.includes('аналитик') || lowerIdea.includes('метрик')) {
      nicheKeywords.push('аналитика', 'дашборд', 'bi');
    } else if (lowerIdea.includes('crm') || lowerIdea.includes('продаж') || lowerIdea.includes('сделк')) {
      nicheKeywords.push('crm', 'продажи');
    } else if (lowerIdea.includes('такси') || lowerIdea.includes('попутн') || lowerIdea.includes('ездк')) {
      nicheKeywords.push('такси', 'транспорт');
    } else if (lowerIdea.includes('доставк') || lowerIdea.includes('логистик')) {
      nicheKeywords.push('доставка', 'логистика');
    } else if (lowerIdea.includes('мессендж') || lowerIdea.includes('чат')) {
      nicheKeywords.push('мессенджер', 'коммуникация');
    } else if (lowerIdea.includes('образован') || lowerIdea.includes('обучен') || lowerIdea.includes('курс')) {
      nicheKeywords.push('образование', 'learning');
    }
    
    // Генерируем конкурентов на основе КОНКРЕТНОЙ ниши
    const competitorsDirect: Competitor[] = [];
    const competitorsIndirect: IndirectCompetitor[] = [];
    
    // === ОНЛАЙН-ЗАПИСЬ ===
    if (nicheKeywords.includes('онлайн-запись')) {
      competitorsDirect.push(
        {
          name: 'YCLIENTS',
          url: 'https://yclients.ru',
          country: 'Россия',
          description: 'Лидер рынка онлайн-записи, универсальное решение',
          features: 'Онлайн-запись, CRM, склад, виджеты, интеграции',
          pricing: 'от 990₽/мес',
          targetAudience: 'Салоны, клиники, образование',
          strengths: ['Полный функционал', 'Интеграции', 'Бесплатный тариф'],
          weaknesses: ['Сложный интерфейс', 'Перегруженность', 'Дорогие доп. функции'],
          opportunities: ['AI-функции', 'Видео-консультации'],
          threats: ['Нишевые решения', 'Dikidi'],
          functionalityScore: '⭐⭐⭐⭐⭐',
          priceScore: '⭐⭐⭐',
          uxScore: '⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        },
        {
          name: 'Dikidi',
          url: 'https://dikidi.net',
          country: 'Россия',
          description: 'Простой сервис записи с современным дизайном',
          features: 'Онлайн-запись, расписание, уведомления',
          pricing: 'от 490₽/мес',
          targetAudience: 'Мастера, малые салоны',
          strengths: ['Простота', 'Дизайн', 'Цена'],
          weaknesses: ['Ограниченный функционал', 'Нет склада'],
          opportunities: ['Расширение функций', 'Аналитика'],
          threats: ['YCLIENTS', 'Бесплатные альтернативы'],
          functionalityScore: '⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        },
        {
          name: 'Sonline',
          url: 'https://sonline.su',
          country: 'Россия',
          description: 'Бюджетный сервис онлайн-записи',
          features: 'Запись, расписание, SMS',
          pricing: 'от 290₽/мес',
          targetAudience: 'Малый бизнес',
          strengths: ['Низкая цена', 'Простота'],
          weaknesses: ['Базовый функционал', 'Мало интеграций'],
          opportunities: ['Новый функционал'],
          threats: ['Крупные конкуренты'],
          functionalityScore: '⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐',
          supportScore: '⭐⭐⭐'
        }
      );
      competitorsIndirect.push(
        { name: 'WhatsApp/Telegram', description: 'Мессенджеры для записи', approach: 'Личная переписка', overlap: 'Запись клиентов', differentiation: 'Нет автоматизации, календаря' },
        { name: 'Google Календарь', description: 'Ручное ведение расписания', approach: 'Самостоятельный учёт', overlap: 'Управление временем', differentiation: 'Нет клиентской части' },
        { name: 'Телефон', description: 'Запись по звонку', approach: 'Голосовая коммуникация', overlap: 'Запись на услугу', differentiation: 'Требует времени, нет напоминаний' }
      );
    }
    // === ТЕЛЕФОНИЯ / АТС ===
    else if (nicheKeywords.includes('телефония') || nicheKeywords.includes('атс')) {
      competitorsDirect.push(
        {
          name: 'Манго Офис',
          url: 'https://mango-office.ru',
          country: 'Россия',
          description: 'Облачная АТС для бизнеса',
          features: 'Виртуальная АТС, CRM-интеграции, запись звонков',
          pricing: 'от 650₽/мес',
          targetAudience: 'Малый и средний бизнес',
          strengths: ['Локализация', 'Интеграции', 'Поддержка'],
          weaknesses: ['Устаревший UI', 'Сложность настройки'],
          opportunities: ['AI-функции', 'Мобильность'],
          threats: ['UIS', 'Telphin'],
          functionalityScore: '⭐⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        },
        {
          name: 'UIS',
          url: 'https://uiscom.ru',
          country: 'Россия',
          description: 'Контакт-центр и виртуальная АТС',
          features: 'АТС, контакт-центр, аналитика',
          pricing: 'от 600₽/мес',
          targetAudience: 'Средний и крупный бизнес',
          strengths: ['Мощный функционал', 'Аналитика'],
          weaknesses: ['Сложность', 'Цена'],
          opportunities: ['SMB-сегмент'],
          threats: ['Манго Офис'],
          functionalityScore: '⭐⭐⭐⭐⭐',
          priceScore: '⭐⭐⭐',
          uxScore: '⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        },
        {
          name: 'Telphin',
          url: 'https://telphin.ru',
          country: 'Россия',
          description: 'IP-телефония для бизнеса',
          features: 'АТС, SIP, интеграция с 1С',
          pricing: 'от 290₽/мес',
          targetAudience: 'Малый бизнес',
          strengths: ['Низкая цена', 'Простота'],
          weaknesses: ['Базовый функционал', 'Старый UI'],
          opportunities: ['Обновление'],
          threats: ['Технологии'],
          functionalityScore: '⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐⭐',
          uxScore: '⭐⭐',
          supportScore: '⭐⭐⭐'
        }
      );
      competitorsIndirect.push(
        { name: 'Telegram', description: 'Мессенджер со звонками', approach: 'Бесплатная связь', overlap: 'Коммуникация', differentiation: 'Не бизнес-ориентирован' },
        { name: 'WhatsApp Business', description: 'Бизнес-мессенджер', approach: 'Чат-коммуникация', overlap: 'Общение с клиентами', differentiation: 'Нет телефонии' },
        { name: 'Skype', description: 'Видеозвонки', approach: 'Конференции', overlap: 'Звонки', differentiation: 'Устаревший, нет АТС' }
      );
    }
    // === АНАЛИТИКА / ДАШБОРД ===
    else if (nicheKeywords.includes('аналитика') || nicheKeywords.includes('дашборд')) {
      competitorsDirect.push(
        {
          name: 'Yandex DataLens',
          url: 'https://cloud.yandex.ru/services/datalens',
          country: 'Россия',
          description: 'Бесплатный BI-сервис',
          features: 'Дашборды, визуализации, интеграции',
          pricing: 'Бесплатно',
          targetAudience: 'Все компании',
          strengths: ['Бесплатность', 'Простота'],
          weaknesses: ['Ограниченные источники'],
          opportunities: ['Расширение'],
          threats: ['Tableau', 'Power BI'],
          functionalityScore: '⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐⭐',
          supportScore: '⭐⭐⭐'
        },
        {
          name: 'Grafana',
          url: 'https://grafana.com',
          country: 'США',
          description: 'Open-source визуализация',
          features: 'Дашборды, плагины, алерты',
          pricing: 'Open source / Enterprise',
          targetAudience: 'IT-команды',
          strengths: ['Гибкость', 'Open source'],
          weaknesses: ['Сложность', 'Нет русского'],
          opportunities: ['SaaS-версия'],
          threats: ['Cloud-native решения'],
          functionalityScore: '⭐⭐⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐',
          supportScore: '⭐⭐⭐'
        },
        {
          name: 'Tableau',
          url: 'https://tableau.com',
          country: 'США',
          description: 'Лидер рынка BI',
          features: 'Визуализация, AI-инсайты',
          pricing: 'от $15/мес',
          targetAudience: 'Крупный бизнес',
          strengths: ['Мощность', 'AI'],
          weaknesses: ['Цена', 'Сложность'],
          opportunities: ['SMB'],
          threats: ['Бесплатные альтернативы'],
          functionalityScore: '⭐⭐⭐⭐⭐',
          priceScore: '⭐⭐',
          uxScore: '⭐⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        }
      );
      competitorsIndirect.push(
        { name: 'Google Sheets', description: 'Таблицы с графиками', approach: 'Самостоятельные отчёты', overlap: 'Визуализация', differentiation: 'Нет real-time' },
        { name: 'Excel / Power BI', description: 'Экосистема Microsoft', approach: 'Интеграция с Office', overlap: 'Отчёты', differentiation: 'Сложность, цена' },
        { name: 'Notion', description: 'Workspace с базами', approach: 'Гибкое хранение', overlap: 'Структура данных', differentiation: 'Нет аналитики' }
      );
    }
    // === CRM ===
    else if (nicheKeywords.includes('crm') || nicheKeywords.includes('продажи')) {
      competitorsDirect.push(
        {
          name: 'Битрикс24',
          url: 'https://bitrix24.ru',
          country: 'Россия',
          description: 'Комплексная CRM-платформа',
          features: 'CRM, задачи, сайт, магазин',
          pricing: 'Бесплатно до 5 чел / от 2490₽',
          targetAudience: 'Малый и средний бизнес',
          strengths: ['Бесплатный тариф', 'Всё в одном'],
          weaknesses: ['Перегруженность', 'Сложность'],
          opportunities: ['AI-функции'],
          threats: ['AmoCRM', 'Нишевые решения'],
          functionalityScore: '⭐⭐⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐⭐',
          uxScore: '⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        },
        {
          name: 'AmoCRM',
          url: 'https://amocrm.ru',
          country: 'Россия',
          description: 'Простая CRM для продаж',
          features: 'Воронка, интеграции, аналитика',
          pricing: 'от 799₽/мес',
          targetAudience: 'Отделы продаж',
          strengths: ['Простота', 'Воронка продаж'],
          weaknesses: ['Ограниченный функционал'],
          opportunities: ['Расширение'],
          threats: ['Битрикс24'],
          functionalityScore: '⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        },
        {
          name: 'Megaplan',
          url: 'https://megaplan.ru',
          country: 'Россия',
          description: 'CRM и управление проектами',
          features: 'CRM, задачи, проекты',
          pricing: 'от 750₽/мес',
          targetAudience: 'Малый бизнес',
          strengths: ['Баланс CRM и задач'],
          weaknesses: ['Меньше интеграций'],
          opportunities: ['Развитие'],
          threats: ['Битрикс24', 'AmoCRM'],
          functionalityScore: '⭐⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        }
      );
      competitorsIndirect.push(
        { name: 'Google Contacts', description: 'Адресная книга', approach: 'Хранение контактов', overlap: 'База клиентов', differentiation: 'Нет функций продаж' },
        { name: 'Trello', description: 'Kanban-доска', approach: 'Визуальное управление', overlap: 'Процессы', differentiation: 'Нет CRM-функций' },
        { name: 'Excel', description: 'Таблицы', approach: 'Самостоятельный учёт', overlap: 'База клиентов', differentiation: 'Нет автоматизации' }
      );
    }
    // === ДЛЯ ДРУГИХ НИШ - ИСПОЛЬЗУЕМ КОНТЕКСТ ИДЕИ ===
    else {
      // Генерируем конкурентов на основе ключевых слов из Идеи
      const mainFunction = idea.functions[0] || 'основная функция';
      const productName = idea.name;
      
      competitorsDirect.push(
        {
          name: `Лидер в нише "${mainFunction.substring(0, 30)}"`,
          url: 'https://example.com',
          country: 'Международный',
          description: `Ведущее решение для ${mainFunction.substring(0, 50)}`,
          features: idea.functions.slice(0, 3).join(', '),
          pricing: 'От $50/мес',
          targetAudience: idea.description.substring(0, 100),
          strengths: ['Бренд', 'Функциональность', 'Поддержка'],
          weaknesses: ['Цена', 'Сложность', 'Нет локализации'],
          opportunities: ['Российский рынок', 'SMB-сегмент'],
          threats: ['Новые игроки', 'Open source'],
          functionalityScore: '⭐⭐⭐⭐',
          priceScore: '⭐⭐⭐',
          uxScore: '⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        },
        {
          name: `Российский аналог для "${productName}"`,
          url: 'https://example.ru',
          country: 'Россия',
          description: `Локальное решение для ${mainFunction.substring(0, 40)}`,
          features: idea.functions.slice(0, 3).join(', '),
          pricing: 'От 1000₽/мес',
          targetAudience: 'Российский бизнес',
          strengths: ['Локализация', 'Поддержка', 'Цена'],
          weaknesses: ['Меньше функций', 'Масштабируемость'],
          opportunities: ['AI', 'Мобильность'],
          threats: ['Зарубежные решения'],
          functionalityScore: '⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐',
          supportScore: '⭐⭐⭐⭐'
        },
        {
          name: `Стартап-альтернатива`,
          url: 'https://startup.example.com',
          country: 'Интернациональный',
          description: `Инновационное решение для ${mainFunction.substring(0, 30)}`,
          features: idea.functions.slice(0, 2).join(', ') + ', AI-функции',
          pricing: 'Freemium',
          targetAudience: 'Стартапы, ранние последователи',
          strengths: ['Инновации', 'Современный UI', 'Цена'],
          weaknesses: ['Надёжность', 'Ограниченный функционал'],
          opportunities: ['Развитие'],
          threats: ['Крупные игроки'],
          functionalityScore: '⭐⭐⭐',
          priceScore: '⭐⭐⭐⭐⭐',
          uxScore: '⭐⭐⭐⭐⭐',
          supportScore: '⭐⭐'
        }
      );
      competitorsIndirect.push(
        { name: 'Excel / Google Sheets', description: 'Таблицы для самостоятельного учёта', approach: 'Ручное ведение', overlap: 'Хранение данных', differentiation: 'Нет автоматизации' },
        { name: 'Notion', description: 'Гибкий workspace', approach: 'Самостоятельная структура', overlap: 'Управление данными', differentiation: 'Нет специализации' },
        { name: 'Ручные процессы', description: 'Традиционные методы', approach: 'Без автоматизации', overlap: 'Решение проблемы', differentiation: 'Низкая эффективность' }
      );
    }
    
    // Определяем размер рынка на основе ниши
    const marketInfo: Record<string, { size: string; trends: string[] }> = {
      'онлайн-запись': { size: '$2 млрд глобально', trends: ['Интеграция с мессенджерами', 'AI-подбор времени', 'Виджеты'] },
      'телефония': { size: '$15 млрд глобально', trends: ['Облачные решения', 'AI-ассистенты', 'Омниканальность'] },
      'аналитика': { size: '$25 млрд глобально', trends: ['Self-service BI', 'Real-time данные', 'AI-инсайты'] },
      'crm': { size: '$80 млрд глобально', trends: ['AI-прогнозирование', 'Автоматизация', 'Интеграции'] }
    };
    
    const market = marketInfo[nicheKeywords[0]] || { size: 'Зависит от ниши', trends: ['AI-интеграция', 'Облачные решения', 'Мобильность'] };
    
    // Генерируем дифференциацию на основе КОНКРЕТНЫХ функций продукта
    const uniqueFeatures = idea.functions.filter(f => 
      f.toLowerCase().includes('ai') || 
      f.toLowerCase().includes('автоматиз') ||
      f.toLowerCase().includes('умн') ||
      f.toLowerCase().includes('интеллект')
    );
    
    return `## 🔍 Конкурентный анализ для "${idea.name}"

### Ключевые слова продукта: ${nicheKeywords.length > 0 ? nicheKeywords.join(', ') : productKeywords.slice(0, 5).join(', ')}

---

### 1. ПРЯМЫЕ КОНКУРЕНТЫ (3 продукта)

${competitorsDirect.map((c, i) => `#### ${i + 1}. ${c.name} ${c.country ? `(${c.country})` : ''}
- **Сайт:** ${c.url}
- **Описание:** ${c.description}
- **Основные функции:** ${c.features}
- **Ценовая модель:** ${c.pricing}
- **Целевая аудитория:** ${c.targetAudience}

**SWOT-анализ:**
| Сильные стороны | Слабые стороны |
|-----------------|----------------|
| ${c.strengths.join('<br>')} | ${c.weaknesses.join('<br>')} |

| Возможности | Угрозы |
|-------------|--------|
| ${c.opportunities.join('<br>')} | ${c.threats.join('<br>')} |
`).join('\n')}

### 2. КОСВЕННЫЕ КОНКУРЕНТЫ

${competitorsIndirect.map((c, i) => `#### ${i + 1}. ${c.name}
- **Описание:** ${c.description}
- **Подход:** ${c.approach}
- **Пересечение:** ${c.overlap}
- **Отличия:** ${c.differentiation}
`).join('\n')}

### 3. СРАВНИТЕЛЬНАЯ ТАБЛИЦА

| Критерий | ${competitorsDirect.slice(0, 3).map(c => c.name).join(' | ')} | ${idea.name} |
|----------|${competitorsDirect.slice(0, 3).map(() => '----------|').join('')}----------|
| Функциональность | ${competitorsDirect.slice(0, 3).map(c => c.functionalityScore).join(' | ')} | ⭐⭐⭐⭐ |
| Цена | ${competitorsDirect.slice(0, 3).map(c => c.priceScore).join(' | ')} | ⭐⭐⭐⭐ |
| UX/UI | ${competitorsDirect.slice(0, 3).map(c => c.uxScore).join(' | ')} | ⭐⭐⭐⭐⭐ |
| Поддержка | ${competitorsDirect.slice(0, 3).map(c => c.supportScore).join(' | ')} | ⭐⭐⭐⭐ |

### 4. АНАЛИЗ РЫНКА

**Размер рынка:** ${market.size}

**Тренды:**
${market.trends.map(t => `- ${t}`).join('\n')}

### 5. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ

На основе анализа функций **${idea.name}**:

${idea.functions.slice(0, 3).map((f, i) => `${i + 1}. **${f}** — оптимизировать UX, добавить подсказки`).join('\n')}

${uniqueFeatures.length > 0 ? `\n**Уникальные AI/автоматизированные функции:**\n${uniqueFeatures.map(f => `- ${f}`).join('\n')}` : ''}

### 6. РЕКОМЕНДАЦИИ ПО ПОЗИЦИОНИРОВАНИЮ

**${idea.name}** должен позиционироваться с акцентом на:
- ${idea.functions[0] || 'Простоту использования'}
- ${nicheKeywords.length > 0 ? nicheKeywords[0] : 'Российский рынок'}
- Соотношение цена/качество`;
  }

  // === CJM ===
  if (agentType === 'cjm_researcher') {
    // Извлекаем контекст из предыдущих этапов (Идея + Конкуренты)
    let ideaContext = '';
    let competitorsInsights: string[] = [];
    
    // Паттерн для извлечения Идеи
    const ideaMatch = message.match(/СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА[\s\S]*?(?=Предыдущий контекст|═══|===|## 1\.|## \d)/i);
    if (ideaMatch) {
      ideaContext = ideaMatch[0];
    }
    
    // Извлекаем инсайты из раздела конкурентов (если есть)
    const competitorsMatch = message.match(/(?:Конкурентный анализ|ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ|ДИФФЕРЕНЦИАЦИ)[\s\S]*?(?=## \d|---|═══|$)/i);
    if (competitorsMatch) {
      // Извлекаем ключевые боли/возможности
      const painPoints = competitorsMatch[0].match(/[-•]\s*([А-Яа-я][^.\n]{10,80})/g);
      if (painPoints) {
        competitorsInsights = painPoints.slice(0, 5).map(p => p.replace(/^[-•]\s*/, '').trim());
      }
    }
    
    // Извлекаем ЦА из идеи
    let targetAudience = 'Пользователи продукта';
    const taMatch = ideaContext.match(/(?:Целевая аудитория|ЦА|Пользовател[иь]|Аудитория)[^:]*:?\s*([^\n]+(?:\n[^\n#]+)*?)(?=\n###|\n##|$)/i);
    if (taMatch && taMatch[1]) {
      targetAudience = taMatch[1].trim().substring(0, 200);
    }
    
    // Извлекаем Use Cases из идеи
    const useCases: string[] = [];
    const ucMatch = ideaContext.match(/(?:Use Cases|Сценарии|Сценарий)[^:]*:?\s*([\s\S]*?)(?=\n###|\n##|$)/i);
    if (ucMatch && ucMatch[1]) {
      const cases = ucMatch[1].match(/\d+\.\s+[^\n]+/g);
      if (cases) {
        cases.forEach(c => useCases.push(c.replace(/^\d+\.\s*/, '').trim()));
      }
    }
    
    // Извлекаем типы пользователей из идеи
    const userTypes: { role: string; description: string }[] = [];
    const utMatch = ideaContext.match(/(?:Типы пользователей|Ролевая модель|Роли)[^:]*:?\s*([\s\S]*?)(?=\n###|\n##|$)/i);
    if (utMatch && utMatch[1]) {
      const lines = utMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const roleMatch = line.match(/\*\*([^*]+)\*\*[—–-]?\s*(.+)/);
        if (roleMatch) {
          userTypes.push({ role: roleMatch[1].trim(), description: roleMatch[2].trim() });
        }
      });
    }
    
    // Если типов пользователей нет, создаём на основе функций
    if (userTypes.length === 0) {
      userTypes.push({ role: 'Пользователь', description: targetAudience.substring(0, 100) });
      // Если есть административные функции, добавляем админа
      if (idea.functions.some(f => f.toLowerCase().includes('управлен') || f.toLowerCase().includes('админ') || f.toLowerCase().includes('настройк'))) {
        userTypes.push({ role: 'Администратор', description: 'Управление настройками и пользователями' });
      }
    }
    
    // Генерируем этапы CJM на основе ФУНКЦИЙ продукта
    const stages: { name: string; actions: { action: string; score: number }[] }[] = [];
    
    // Этап 1: Начало (всегда есть)
    stages.push({
      name: 'Начало работы',
      actions: [
        { action: `Обнаружение ${idea.name}`, score: 3 },
        { action: 'Изучение возможностей', score: 4 },
        { action: 'Регистрация/Вход', score: 3 }
      ]
    });
    
    // Этапы на основе функций продукта
    idea.functions.slice(0, 4).forEach((func, idx) => {
      const funcName = func.replace(/^[–—•]\s*/, '').substring(0, 50);
      stages.push({
        name: funcName,
        actions: [
          { action: `Доступ к: ${funcName}`, score: 4 },
          { action: `Использование: ${funcName}`, score: 4 + (idx % 2) },
          { action: `Получение результата`, score: 5 }
        ]
      });
    });
    
    // Финальный этап
    stages.push({
      name: 'Регулярное использование',
      actions: [
        { action: 'Повторное использование', score: 5 },
        { action: 'Рекомендация продукта', score: 5 }
      ]
    });
    
    // Генерируем Mermaid journey для каждой роли
    const journeyDiagrams = userTypes.map((ut) => {
      const stagesMermaid = stages.map(stage => {
        const actionsMermaid = stage.actions.map(a => `      ${a.action}: ${a.score}: ${ut.role}`).join('\n');
        return `    section ${stage.name}\n${actionsMermaid}`;
      }).join('\n');
      
      return `### CJM для "${ut.role}"

**Описание:** ${ut.description}

\`\`\`mermaid
journey
    title Путь: ${ut.role} в ${idea.name}
${stagesMermaid}
\`\`\``;
    }).join('\n\n');
    
    // Генерируем таблицу на основе функций
    const tableRows = stages.slice(0, 5).map((stage, idx) => {
      const touchpoints = idx === 0 ? 'Сайт, реклама, рекомендации' : 
                          idx === stages.length - 1 ? 'Уведомления, поддержка' : 
                          'Интерфейс продукта';
      return {
        stage: stage.name,
        goal: stage.actions[1]?.action.replace('Использование: ', '') || 'Получить ценность',
        touchpoints,
        emotion: `${3 + idx}/5`,
        pains: competitorsInsights[idx] || 'Возможные сложности с навигацией'
      };
    });
    
    const tableMarkdown = `| Этап | Цель | Touchpoints | Эмоция | Боли |
|------|------|-------------|--------|------|
${tableRows.map(r => `| ${r.stage} | ${r.goal} | ${r.touchpoints} | ${r.emotion} | ${r.pains} |`).join('\n')}`;
    
    // Инсайты на основе функций продукта
    const functionsInsights = idea.functions.slice(0, 3).map((f, i) => 
      `${i + 1}. **${f}** — обеспечить интуитивный доступ, добавить подсказки`
    ).join('\n');
    
    // Боли из конкурентного анализа
    const painsFromCompetitors = competitorsInsights.length > 0 
      ? competitorsInsights.map(p => `| ${p} | Влияет на удовлетворённость | Решить в интерфейсе |`).join('\n')
      : '| Сложность первого использования | Барьер входа | Упростить onboarding |\n| Недостаточная обратная связь | Путаница в действиях | Добавить уведомления о результатах |';
    
    return `## 🗺️ Customer Journey Map для "${idea.name}"

### Определение ролей пользователей
${userTypes.map((ut, i) => `${i + 1}. **${ut.role}** — ${ut.description}`).join('\n')}

### Целевая аудитория
${targetAudience}

---

${journeyDiagrams}

---

### Детальный анализ этапов

${tableMarkdown}

### Критические точки и боли

| Боль | Влияние | Решение |
|------|---------|---------|
${painsFromCompetitors}

### Ключевые инсайты для дизайна

**На основе функций продукта:**
${functionsInsights}

**На основе анализа конкурентов:**
${competitorsInsights.length > 0 ? competitorsInsights.map(i => `- ${i}`).join('\n') : '- Упростить первый опыт пользователя'}

**Рекомендации:**
- Минимизировать шаги для ключевых действий
- Добавить контекстные подсказки
- Обеспечить обратную связь при каждом действии`;
  }

  // === IA / USERFLOW ===
  if (agentType === 'ia_architect') {
    // СНАЧАЛА проверяем на USERFLOW - более специфичные ключевые слова
    if (lowerMessage.includes('userflow') || lowerMessage.includes('пользовательск') || 
        lowerMessage.includes('сценар') || lowerMessage.includes('flowchart') ||
        lowerMessage.includes('happy path') || lowerMessage.includes('альтернативн') ||
        lowerMessage.includes('оптимальн') || lowerMessage.includes('основной userflow')) {
      return `## 🔄 Userflow сценарии для "${idea.name}"

### 1. 🎯 Основной Userflow (Happy Path)

\`\`\`mermaid
flowchart TD
    A[Старт] --> B[Открытие приложения]
    B --> C[Просмотр главного экрана]
    C --> D{Выбор действия}
    D --> E[${idea.functions[0]?.substring(0, 30) || 'Основная функция'}]
    E --> F[Получение результата]
    F --> G[Удовлетворение потребности]
    G --> H[Возврат или завершение]
    style A fill:#f5b942,color:#000
    style H fill:#22c55e,color:#fff
\`\`\`

**Описание:** Пользователь открывает приложение, выбирает нужную функцию и получает результат за минимальное количество шагов.

---

### 2. 🔄 Альтернативный Userflow

\`\`\`mermaid
flowchart TD
    A[Старт] --> B[Открытие приложения]
    B --> C[Поиск через поиск/фильтры]
    C --> D{Результаты найдены?}
    D -->|Да| E[Выбор из результатов]
    D -->|Нет| F[Расширение критериев]
    F --> C
    E --> G[Действие с выбранным]
    G --> H[Результат]
    style A fill:#f5b942,color:#000
    style H fill:#22c55e,color:#fff
\`\`\`

**Описание:** Пользователь использует поиск или фильтры для нахождения нужного объекта перед выполнением основного действия.

---

### 3. ⚡ Оптимальный Userflow (Оптимистичный)

\`\`\`mermaid
flowchart TD
    A[Старт] --> B[Быстрое действие с главного экрана]
    B --> C[Мгновенный результат]
    C --> D[Готово!]
    style A fill:#f5b942,color:#000
    style D fill:#22c55e,color:#fff
\`\`\`

**Описание:** Опытный пользователь или при идеальных условиях - действие выполняется в 1-2 клика через виджеты, шорткаты или избранное.

---

### 4. 📱 Описание ключевых экранов

| Экран | Цель | Ключевые элементы | Действия пользователя |
|-------|------|-------------------|----------------------|
| **Главный** | Быстрый доступ к функциям | Кнопки действий, виджеты, избранное | Выбор функции, навигация |
| **${idea.functions[0]?.substring(0, 20) || 'Функция 1'}** | Выполнение основной задачи | Форма ввода, результаты | Ввод данных, подтверждение |
| **Результаты** | Просмотр результата | Детали, действия, шеринг | Сохранение, повтор, выход |
| **Профиль** | Управление аккаунтом | Настройки, история | Редактирование, выход |`;
    }
    
    // ПОТОМ проверяем на IA
    if (lowerMessage.includes('таксономи') || lowerMessage.includes('сущност') || lowerMessage.includes('информационн')) {
      return `## 🏗️ Информационная архитектура для "${idea.name}"

### Структура продукта

\`\`\`mermaid
mindmap
  root((${idea.name}))
    Главная
      Дашборд
      Быстрые действия
    ${idea.functions[0]?.substring(0, 20) || 'Функции'}
      Основные
      Дополнительные
    Профиль
      Настройки
      История
\`\`\`

### Таксономия сущностей

\`\`\`mermaid
erDiagram
    USER ||--o{ ITEM : creates
    USER ||--o{ ACTION : performs
    USER {
        string id PK
        string email
        string name
    }
    ITEM {
        string id PK
        string title
        string status
    }
\`\`\`

### Навигационная структура
- Главная → Дашборд
- ${idea.functions[0]?.substring(0, 30) || 'Функции'} → Детали
- Профиль → Настройки`;
    }
    
    // Default - IA без специфичных ключевых слов
    return `## 🏗️ Информационная архитектура для "${idea.name}"

### Структура продукта

\`\`\`mermaid
mindmap
  root((${idea.name}))
    Главная
      Дашборд
      Быстрые действия
    ${idea.functions[0]?.substring(0, 20) || 'Функции'}
      Основные
      Дополнительные
    Профиль
      Настройки
      История
\`\`\`

### Таксономия сущностей

\`\`\`mermaid
erDiagram
    USER ||--o{ ITEM : creates
    USER ||--o{ ACTION : performs
    USER {
        string id PK
        string email
        string name
    }
    ITEM {
        string id PK
        string title
        string status
    }
\`\`\`

### Навигационная структура
- Главная → Дашборд
- ${idea.functions[0]?.substring(0, 30) || 'Функции'} → Детали
- Профиль → Настройки`;
  }


  // === ПРОТОТИП ===
  if (agentType === 'prototyper') {
    // Detect product type for better defaults
    const productType = detectProductType(message + ' ' + idea.name + ' ' + idea.description);
    
    // Clean product name from markdown
    const productName = idea.name.replace(/\*\*/g, '').replace(/["«»]/g, '').trim();
    
    // Smart function extraction with null checks
    let func1 = idea.functions[0] || 'Основная функция';
    let func2 = idea.functions[1] || 'Дополнительные возможности';
    let func3 = idea.functions[2] || 'Настройки';
    
    // Product-type specific defaults
    if (!func1 || func1 === 'Основная функция продукта') {
      const defaultFunctions: Record<string, string[]> = {
        booking: ['Онлайн-запись на услугу', 'Календарь свободных слотов', 'SMS-напоминания'],
        ats: ['Виртуальная АТС', 'Запись звонков', 'Аналитика'],
        dashboard: ['Виджеты и графики', 'Экспорт отчётов', 'Real-time данные'],
        crm: ['Управление сделками', 'Контакт-профили', 'Автоматизация'],
        ecommerce: ['Каталог товаров', 'Корзина и оплата', 'Отслеживание заказа'],
        taxi: ['Заказ поездки', 'Отслеживание машины', 'Оплата в приложении'],
        messenger: ['Чаты и звонки', 'Групповые беседы', 'Шаринг файлов'],
        task: ['Kanban-доска', 'Задачи и дедлайны', 'Командная работа'],
        hr: ['Вакансии и отклики', 'Кандидаты', 'Онбординг'],
        fintech: ['Платежи и переводы', 'Баланс и выписки', 'Бюджетирование'],
        education: ['Курсы и уроки', 'Прогресс обучения', 'Сертификаты'],
        health: ['Запись к врачу', 'Медицинская карта', 'Телемедицина'],
        logistics: ['Отслеживание груза', 'Маршруты доставки', 'Документы'],
        default: ['Основная функция', 'Дополнительные возможности', 'Настройки']
      };
      
      const funcs = defaultFunctions[productType.id] || defaultFunctions.default;
      func1 = funcs[0];
      func2 = funcs[1];
      func3 = funcs[2];
    }
    
    // Extract value proposition from description
    const valueProp = idea.description.length > 100 
      ? idea.description.substring(0, 100) + '...'
      : idea.description || 'Инновационное решение для вашего бизнеса';
    
    console.log(`[Fallback Prototype] Product: "${productName}", Type: ${productType.id}, Functions: [${func1}, ${func2}, ${func3}]`);
    
    return `## 🎨 Интерактивный прототип "${productName}"

\`\`\`html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${productName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #000; color: #fff; min-height: 100vh; overflow-x: hidden; }
        
        /* Screen system */
        .screen { display: none; min-height: 100vh; position: relative; }
        .screen.active { display: flex; flex-direction: column; }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.3); } 50% { box-shadow: 0 0 35px rgba(250, 204, 21, 0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        .fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        
        /* Colors */
        :root {
            --bg: #000000;
            --bg-card: #0A0A0A;
            --bg-elevated: #141414;
            --border: #1A1A1A;
            --text: #FFFFFF;
            --text-secondary: #A3A3A3;
            --text-muted: #737373;
            --accent: #FACC15;
            --success: #22C55E;
            --error: #EF4444;
        }
        
        .mono { font-family: 'JetBrains Mono', monospace; }
        .gradient-text { background: linear-gradient(90deg, #FACC15, #FEF08A, #FACC15); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        
        /* Grid background */
        .grid-bg { background-image: linear-gradient(rgba(250, 204, 21, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250, 204, 21, 0.03) 1px, transparent 1px); background-size: 50px 50px; }
        
        /* Scanline effect */
        .scanline { position: fixed; left: 0; right: 0; height: 4px; background: linear-gradient(to bottom, transparent, rgba(250, 204, 21, 0.15), transparent); animation: scanline 6s linear infinite; pointer-events: none; z-index: 9999; }
        
        /* Buttons */
        .btn-primary { 
            padding: 14px 32px; border-radius: 12px; border: none; 
            background: var(--accent); color: #000; font-weight: 700; font-size: 16px; 
            cursor: pointer; transition: all 0.3s;
        }
        .btn-primary:hover { transform: scale(1.02); }
        
        .btn-secondary { 
            padding: 14px 32px; border-radius: 12px; border: 1px solid var(--border); 
            background: transparent; color: var(--text); font-weight: 600; font-size: 16px; 
            cursor: pointer; transition: all 0.3s;
        }
        .btn-secondary:hover { border-color: var(--accent); }
        
        /* Cards */
        .card {
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 20px;
            transition: all 0.3s;
            position: relative;
        }
        .card:hover { border-color: var(--accent); }
        .card::before { content: ''; position: absolute; inset: -1px; background: linear-gradient(45deg, var(--accent), transparent, var(--accent)); border-radius: inherit; z-index: -1; opacity: 0; transition: opacity 0.3s; }
        .card:hover::before { opacity: 1; }
        
        /* Input */
        .input {
            width: 100%; padding: 14px 16px; border-radius: 12px;
            border: 1px solid var(--border); background: var(--bg-card);
            color: var(--text); font-size: 16px; font-family: inherit;
            transition: all 0.2s;
        }
        .input:focus { outline: none; border-color: var(--accent); }
        .input::placeholder { color: var(--text-muted); }
        
        /* SPLASH SCREEN */
        #splash { align-items: center; justify-content: center; text-align: center; padding: 40px; }
        .logo-large { 
            width: 100px; height: 100px; border-radius: 24px; 
            background: linear-gradient(135deg, var(--accent), #FDE047);
            display: flex; align-items: center; justify-content: center; 
            font-size: 40px; font-weight: 900; color: #000; 
            margin: 0 auto 32px;
        }
        .splash-title { font-size: 36px; font-weight: 900; margin-bottom: 16px; letter-spacing: -1px; }
        .splash-desc { color: var(--text-secondary); max-width: 300px; margin: 0 auto 40px; line-height: 1.6; }
        
        /* ONBOARDING */
        #onboarding { padding: 60px 24px 40px; }
        .progress-bar { width: 100%; height: 4px; background: var(--border); border-radius: 2px; margin-bottom: 48px; }
        .progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s; }
        .step { text-align: center; padding: 40px 0; }
        .step-icon { font-size: 64px; margin-bottom: 24px; }
        .step-title { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
        .step-desc { color: var(--text-secondary); }
        .onboarding-buttons { display: flex; gap: 12px; margin-top: auto; padding-top: 40px; }
        
        /* MAIN / DASHBOARD */
        #main { background: var(--bg); }
        
        .header { 
            position: fixed; top: 0; left: 0; right: 0; 
            padding: 16px 20px; 
            background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); 
            z-index: 100; border-bottom: 1px solid var(--border); 
            display: flex; justify-content: space-between; align-items: center;
        }
        .header-logo { display: flex; align-items: center; gap: 12px; }
        .header-logo-icon { 
            width: 36px; height: 36px; border-radius: 10px; 
            background: var(--accent); 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 900; color: #000; font-size: 14px;
        }
        .header-title { font-weight: 700; font-size: 18px; }
        .header-action { 
            width: 40px; height: 40px; border-radius: 50%; 
            background: var(--bg-elevated); border: none;
            display: flex; align-items: center; justify-content: center; 
            cursor: pointer; font-size: 18px;
        }
        
        .main-content { flex: 1; padding: 80px 20px 100px; overflow-y: auto; }
        
        .welcome-section { margin-bottom: 24px; }
        .welcome-title { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
        .welcome-subtitle { color: var(--text-secondary); font-size: 14px; }
        
        .stats-row { display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 8px; }
        .stat-card { 
            flex: 1; min-width: 100px;
            background: var(--bg-elevated); border: 1px solid var(--border);
            border-radius: 12px; padding: 16px; text-align: center;
        }
        .stat-value { font-size: 24px; font-weight: 700; color: var(--accent); }
        .stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        
        .quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        .action-card { 
            background: var(--bg-elevated); border: 1px solid var(--border);
            border-radius: 16px; padding: 20px; text-align: center; 
            cursor: pointer; transition: all 0.3s;
        }
        .action-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .action-icon { font-size: 32px; margin-bottom: 8px; }
        .action-title { font-weight: 600; font-size: 13px; color: var(--text-secondary); }
        
        .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .section-title span { color: var(--accent); }
        
        .bottom-nav { 
            position: fixed; bottom: 0; left: 0; right: 0; 
            background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); 
            border-top: 1px solid var(--border); 
            display: flex; justify-content: space-around; padding: 12px 0;
        }
        .nav-item { 
            display: flex; flex-direction: column; align-items: center; gap: 4px; 
            color: var(--text-muted); cursor: pointer; 
            padding: 8px 16px; border-radius: 12px; 
            transition: all 0.2s; border: none; background: none;
            font-family: inherit; font-size: inherit;
        }
        .nav-item.active { color: var(--accent); }
        .nav-item:hover { background: var(--bg-elevated); }
        .nav-icon { font-size: 20px; }
        .nav-label { font-size: 11px; font-weight: 500; }
        
        /* ACTION SCREEN */
        #action { background: var(--bg); }
        .back-header { 
            position: fixed; top: 0; left: 0; right: 0; 
            padding: 16px 20px; 
            background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); 
            z-index: 100; border-bottom: 1px solid var(--border); 
            display: flex; align-items: center; gap: 16px;
        }
        .back-btn { 
            width: 40px; height: 40px; border-radius: 50%; 
            background: var(--bg-elevated); border: none; 
            color: var(--text); cursor: pointer; 
            display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .screen-title { font-weight: 700; font-size: 18px; }
        .action-content { flex: 1; padding: 80px 20px 20px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; color: var(--text-secondary); }
        
        /* RESULT SCREEN */
        #result { align-items: center; justify-content: center; text-align: center; padding: 40px; }
        .result-icon { 
            width: 100px; height: 100px; border-radius: 50%; 
            background: var(--success); 
            display: flex; align-items: center; justify-content: center; 
            font-size: 48px; margin: 0 auto 32px;
        }
        .result-title { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
        .result-message { color: var(--text-secondary); margin-bottom: 32px; }
        .result-buttons { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px; }
        
        /* PROFILE SCREEN */
        #profile { background: var(--bg); }
        .profile-header { text-align: center; padding: 80px 20px 24px; border-bottom: 1px solid var(--border); }
        .profile-avatar { 
            width: 80px; height: 80px; border-radius: 50%; 
            background: linear-gradient(135deg, var(--accent), #FDE047); 
            margin: 0 auto 16px; 
            display: flex; align-items: center; justify-content: center; font-size: 32px;
        }
        .profile-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .profile-email { color: var(--text-muted); font-size: 14px; }
        .settings-list { padding: 20px; }
        .settings-item { 
            display: flex; align-items: center; gap: 16px; 
            padding: 16px; 
            background: var(--bg-elevated); border: 1px solid var(--border);
            border-radius: 12px; margin-bottom: 12px; 
            cursor: pointer; transition: all 0.2s;
        }
        .settings-item:hover { border-color: var(--accent); }
        .settings-icon { font-size: 24px; }
        .settings-text { flex: 1; font-weight: 500; }
        .settings-arrow { color: var(--text-muted); }
        
        /* TOAST */
        .toast { 
            position: fixed; bottom: 100px; left: 20px; right: 20px; 
            background: var(--bg-elevated); border: 1px solid var(--success);
            border-radius: 12px; padding: 16px; 
            display: flex; align-items: center; gap: 12px; 
            transform: translateY(200%); transition: transform 0.3s; z-index: 200;
        }
        .toast.show { transform: translateY(0); }
        .toast-icon { 
            width: 32px; height: 32px; border-radius: 50%; 
            background: var(--success); 
            display: flex; align-items: center; justify-content: center;
        }
        .toast-text { flex: 1; }
        .toast-title { font-weight: 600; font-size: 14px; }
        .toast-message { font-size: 12px; color: var(--text-secondary); }
    </style>
</head>
<body>
    <div class="scanline"></div>
    
    <!-- SPLASH SCREEN -->
    <div id="splash" class="screen active grid-bg">
        <div class="fade-in">
            <div class="logo-large animate-float">${productName.substring(0, 2).toUpperCase()}</div>
            <h1 class="splash-title">${productName}</h1>
            <p class="splash-desc">${valueProp}</p>
            <button class="btn-primary animate-glow" onclick="showScreen('onboarding')">Начать</button>
        </div>
    </div>

    <!-- ONBOARDING -->
    <div id="onboarding" class="screen grid-bg">
        <div class="progress-bar"><div class="progress-fill" id="progress" style="width: 33%"></div></div>
        
        <div id="step1" class="step fade-in">
            <div class="step-icon">✨</div>
            <h2 class="step-title">${func1.substring(0, 40)}</h2>
            <p class="step-desc">Ключевая возможность продукта</p>
        </div>
        
        <div id="step2" class="step" style="display: none;">
            <div class="step-icon">🎯</div>
            <h2 class="step-title">${func2.substring(0, 40)}</h2>
            <p class="step-desc">Дополнительные функции</p>
        </div>
        
        <div id="step3" class="step" style="display: none;">
            <div class="step-icon">🚀</div>
            <h2 class="step-title">Готовы начать?</h2>
            <p class="step-desc">${func3.substring(0, 40)}</p>
        </div>
        
        <div class="onboarding-buttons">
            <button class="btn-secondary" id="skipBtn" onclick="showScreen('main')">Пропустить</button>
            <button class="btn-primary animate-glow" id="nextBtn" onclick="nextStep()">Далее</button>
        </div>
    </div>

    <!-- MAIN / DASHBOARD -->
    <div id="main" class="screen">
        <header class="header">
            <div class="header-logo">
                <div class="header-logo-icon">${productName.substring(0, 2).toUpperCase()}</div>
                <span class="header-title">${productName.split(' ')[0]}</span>
            </div>
            <button class="header-action" onclick="showScreen('profile')">👤</button>
        </header>
        
        <main class="main-content">
            <section class="welcome-section fade-in">
                <h2 class="welcome-title">Добро пожаловать!</h2>
                <p class="welcome-subtitle">${valueProp.substring(0, 60)}</p>
            </section>
            
            <div class="stats-row">
                <div class="stat-card animate-float" style="animation-delay: 0s;">
                    <div class="stat-value mono">24</div>
                    <div class="stat-label">Сегодня</div>
                </div>
                <div class="stat-card animate-float" style="animation-delay: 0.1s;">
                    <div class="stat-value mono">+12%</div>
                    <div class="stat-label">Рост</div>
                </div>
                <div class="stat-card animate-float" style="animation-delay: 0.2s;">
                    <div class="stat-value mono">5</div>
                    <div class="stat-label">В процессе</div>
                </div>
            </div>
            
            <section class="quick-actions">
                <div class="action-card" onclick="showScreen('action')">
                    <div class="action-icon">⚡</div>
                    <div class="action-title">${func1.substring(0, 20)}</div>
                </div>
                <div class="action-card">
                    <div class="action-icon">📊</div>
                    <div class="action-title">Статистика</div>
                </div>
                <div class="action-card">
                    <div class="action-icon">📅</div>
                    <div class="action-title">История</div>
                </div>
                <div class="action-card" onclick="showScreen('profile')">
                    <div class="action-icon">⚙️</div>
                    <div class="action-title">Настройки</div>
                </div>
            </section>
            
            <section>
                <h3 class="section-title">Возможности <span>→</span></h3>
                <div class="card" style="margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="font-size: 28px;">🎯</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${func1.substring(0, 30)}</div>
                            <div style="font-size: 13px; color: var(--text-muted);">Основная функция</div>
                        </div>
                        <span style="color: var(--text-muted);">→</span>
                    </div>
                </div>
                <div class="card" style="margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="font-size: 28px;">🔒</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${func2.substring(0, 30)}</div>
                            <div style="font-size: 13px; color: var(--text-muted);">Безопасность</div>
                        </div>
                        <span style="color: var(--text-muted);">→</span>
                    </div>
                </div>
                <div class="card">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="font-size: 28px;">📈</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${func3.substring(0, 30)}</div>
                            <div style="font-size: 13px; color: var(--text-muted);">Аналитика</div>
                        </div>
                        <span style="color: var(--text-muted);">→</span>
                    </div>
                </div>
            </section>
        </main>
        
        <nav class="bottom-nav">
            <button class="nav-item active" onclick="showScreen('main')">
                <span class="nav-icon">🏠</span>
                <span class="nav-label">Главная</span>
            </button>
            <button class="nav-item" onclick="showScreen('action')">
                <span class="nav-icon">➕</span>
                <span class="nav-label">Действие</span>
            </button>
            <button class="nav-item" onclick="showScreen('profile')">
                <span class="nav-icon">👤</span>
                <span class="nav-label">Профиль</span>
            </button>
        </nav>
    </div>

    <!-- ACTION SCREEN -->
    <div id="action" class="screen">
        <header class="back-header">
            <button class="back-btn" onclick="showScreen('main')">←</button>
            <span class="screen-title">${func1.substring(0, 30)}</span>
        </header>
        
        <main class="action-content">
            <div class="card fade-in">
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Выполнить действие</h3>
                
                <div class="form-group">
                    <label class="form-label">Название</label>
                    <input type="text" class="input" placeholder="Введите данные">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Категория</label>
                    <select class="input">
                        <option>Категория 1</option>
                        <option>Категория 2</option>
                        <option>Категория 3</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Описание</label>
                    <textarea class="input" rows="3" placeholder="Дополнительная информация"></textarea>
                </div>
                
                <button class="btn-primary animate-glow" style="width: 100%; margin-top: 16px;" onclick="showScreen('result')">Выполнить</button>
            </div>
        </main>
    </div>

    <!-- RESULT SCREEN -->
    <div id="result" class="screen grid-bg">
        <div class="fade-in">
            <div class="result-icon animate-pulse">✓</div>
            <h2 class="result-title">Успешно выполнено!</h2>
            <p class="result-message">Действие "${func1.substring(0, 20)}" успешно завершено.</p>
            <div class="result-buttons">
                <button class="btn-primary animate-glow" onclick="showScreen('main')">На главную</button>
                <button class="btn-secondary" onclick="showScreen('action')">Новое действие</button>
            </div>
        </div>
    </div>

    <!-- PROFILE SCREEN -->
    <div id="profile" class="screen">
        <header class="back-header">
            <button class="back-btn" onclick="showScreen('main')">←</button>
            <span class="screen-title">Профиль</span>
        </header>
        
        <div class="profile-header">
            <div class="profile-avatar">👤</div>
            <div class="profile-name">Пользователь</div>
            <div class="profile-email">user@example.com</div>
        </div>
        
        <div class="settings-list">
            <div class="settings-item" onclick="showToast('Настройки сохранены')">
                <span class="settings-icon">⚙️</span>
                <span class="settings-text">Настройки аккаунта</span>
                <span class="settings-arrow">→</span>
            </div>
            <div class="settings-item" onclick="showToast('Уведомления обновлены')">
                <span class="settings-icon">🔔</span>
                <span class="settings-text">Уведомления</span>
                <span class="settings-arrow">→</span>
            </div>
            <div class="settings-item">
                <span class="settings-icon">🔒</span>
                <span class="settings-text">Безопасность</span>
                <span class="settings-arrow">→</span>
            </div>
            <div class="settings-item">
                <span class="settings-icon">❓</span>
                <span class="settings-text">Помощь</span>
                <span class="settings-arrow">→</span>
            </div>
            <div class="settings-item" onclick="showScreen('splash')" style="border-color: var(--error);">
                <span class="settings-icon">🚪</span>
                <span class="settings-text" style="color: var(--error);">Выйти</span>
                <span class="settings-arrow">→</span>
            </div>
        </div>
    </div>

    <!-- TOAST -->
    <div id="toast" class="toast">
        <div class="toast-icon">✓</div>
        <div class="toast-text">
            <div class="toast-title">Успешно!</div>
            <div class="toast-message" id="toastMessage">Действие выполнено</div>
        </div>
    </div>

    <script>
        let currentStep = 1;
        const totalSteps = 3;
        
        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const screen = document.getElementById(id);
            if (screen) {
                screen.classList.add('active');
                window.scrollTo(0, 0);
            }
        }
        
        function nextStep() {
            if (currentStep < totalSteps) {
                document.getElementById('step' + currentStep).style.display = 'none';
                currentStep++;
                const nextStepEl = document.getElementById('step' + currentStep);
                nextStepEl.style.display = 'block';
                nextStepEl.classList.add('fade-in');
                document.getElementById('progress').style.width = (currentStep / totalSteps * 100) + '%';
                
                if (currentStep === totalSteps) {
                    document.getElementById('nextBtn').textContent = 'Начать работу';
                    document.getElementById('nextBtn').onclick = () => showScreen('main');
                    document.getElementById('skipBtn').style.display = 'none';
                }
            }
        }
        
        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMessage').textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    </script>
</body>
</html>
\`\`\``;
  }
  // === ТЕСТИРОВАНИЕ ===
  if (agentType === 'task_architect') {
    if (lowerMessage.includes('приглаш') || lowerMessage.includes('скрипт')) {
      return `## 📧 Скрипт приглашения для "${idea.name}"

### Email-приглашение

**Тема:** Приглашение на тестирование ${idea.name}

Здравствуйте!

Приглашаем вас принять участие в тестировании ${idea.name} — ${idea.description.substring(0, 100)}.

**Что тестируем:** ${idea.name}
**Формат:** Онлайн (Zoom)
**Длительность:** 30-45 минут
**Вознаграждение:** [указать]

**Профиль участника:**
- Интерес к теме: ${idea.description.substring(0, 50)}
- Опыт использования похожих продуктов

Записаться: [ссылка]

---

### Telegram/WhatsApp

🧪 Приглашение на тестирование!

Продукт: ${idea.name}
📝 ${idea.description.substring(0, 80)}
⏱️ Время: 30-45 мин
🎁 Благодарность: [указать]

Записаться: [ссылка]`;
    }
    
    if (lowerMessage.includes('гайдлайн') || lowerMessage.includes('руководство')) {
      return `## 📖 Гайдлайн юзабилити-тестирования для "${idea.name}"

### Структура сессии (45 минут)

| Этап | Время | Действие |
|------|-------|----------|
| Приветствие | 3 мин | Знакомство |
| Введение | 5 мин | Объяснение формата |
| Задачи | 25 мин | Тестирование |
| Интервью | 10 мин | Вопросы |
| Завершение | 2 мин | Благодарность |

### Задачи для тестирования

1. **Ознакомление:** Посмотрите главную страницу, что это за продукт?
2. **Основная задача:** ${idea.functions[0] || 'Используйте основную функцию'}
3. **Поиск функции:** Найдите ${idea.functions[1] || 'дополнительную функцию'}
4. **Завершение:** Выполните целевое действие
5. **Обратная связь:** Оцените удобство

### Вопросы пост-тест

1. Первое впечатление?
2. Что было сложно?
3. Что понравилось?
4. Что изменить?
5. Оценка 1-10`;
    }
    
    return `## 📊 Продуктовые метрики для "${idea.name}"

### 1. Северная метрика
Количество успешных ${idea.functions[0]?.toLowerCase() || 'целевых действий'}

### 2. Acquisition
- Визиты на сайт
- Регистрации
- Конверсия в регистрацию

### 3. Activation
- Time to first value
- Первое успешное действие
- Feature adoption

### 4. Retention
- Day 1/7/30 retention
- DAU/MAU
- Возвращаемость

### 5. Revenue (если применимо)
- ARPU
- LTV
- Conversion to paid

### Рекомендации по отслеживанию
- Настроить цели в Яндекс.Метрике
- Логировать: ${idea.functions.slice(0, 3).join(', ') || 'ключевые действия'}
- Создать дашборд мониторинга`;
  }

  return `Обработка запроса. Попробуйте ещё раз.`;
}
