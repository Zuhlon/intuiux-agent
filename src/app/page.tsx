'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { MessageContent } from '@/components/MessageContent';
import { 
  Upload, 
  Sparkles, 
  FileText, 
  X, 
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Network,
  Users,
  Github,
  Mail,
  ClipboardList,
  BarChart,
  RefreshCw,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Send,
  Square,
  Play
} from 'lucide-react';

// 9-stage pipeline
const PIPELINE_STAGES = [
  {
    id: 'idea',
    name: 'Идея',
    fullName: 'Формирование идеи',
    description: 'Извлечение идеи из текста или транскрипции',
    agent: 'transcription_analyst',
    icon: Lightbulb,
    color: 'from-amber-400 to-yellow-500'
  },
  {
    id: 'competitors',
    name: 'Конкуренты',
    fullName: 'Конкурентный анализ',
    description: '3 прямых и 3 косвенных конкурента',
    agent: 'brand_marketer',
    icon: BarChart3,
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 'cjm',
    name: 'CJM',
    fullName: 'Customer Journey Map',
    description: 'Карта пути пользователя',
    agent: 'cjm_researcher',
    icon: TrendingUp,
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'ia',
    name: 'IA',
    fullName: 'Информационная архитектура',
    description: 'Структура продукта',
    agent: 'ia_architect',
    icon: Network,
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'userflow',
    name: 'Userflow',
    fullName: 'Пользовательские сценарии',
    description: 'Детальные userflow',
    agent: 'ia_architect',
    icon: Users,
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'prototype',
    name: 'Прототип',
    fullName: 'Интерактивный прототип',
    description: 'HTML прототип → GitHub',
    agent: 'prototyper',
    icon: Github,
    color: 'from-violet-400 to-purple-500'
  },
  {
    id: 'invitation',
    name: 'Приглашение',
    fullName: 'Скрипт приглашения',
    description: 'Скрипт для рекрутинга',
    agent: 'task_architect',
    icon: Mail,
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'guideline',
    name: 'Гайдлайн',
    fullName: 'Юзабилити-тестирование',
    description: 'Руководство по проведению',
    agent: 'task_architect',
    icon: ClipboardList,
    color: 'from-rose-400 to-pink-500'
  },
  {
    id: 'metrics',
    name: 'Метрики',
    fullName: 'Продуктовые метрики',
    description: 'Что отслеживать',
    agent: 'task_architect',
    icon: BarChart,
    color: 'from-teal-400 to-emerald-500'
  }
];

interface StageResult {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  content: string;
  githubUrl?: string;
}

// Extract product name from idea text
function extractProductName(ideaText: string): string {
  const patterns = [
    /(?:Название|название идеи|продукт)[^:]*:?\s*\*\*?([^*\n]+)\*\*?/i,
    /(?:###?\s*)?(?:Название|Идея)[^:]*:?\s*(.+?)(?:\n|$)/i,
    /^##\s*(.+?)$/m,
    /^#\s*(.+?)$/m
  ];
  
  for (const pattern of patterns) {
    const match = ideaText.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 50);
    }
  }
  
  const lines = ideaText.split('\n').filter(l => l.trim() && !l.startsWith('==='));
  if (lines.length > 0) {
    return lines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '').substring(0, 50);
  }
  
  return 'Продукт';
}

// Extract short summary from idea text for display
function extractIdeaSummary(ideaText: string): { name: string; description: string } {
  let name = 'Продукт';
  let description = '';
  
  const nameLineMatch = ideaText.match(/## 💡\s*Название идеи\s*\n(.+?)(?:\n|$)/i);
  if (nameLineMatch && nameLineMatch[1]) {
    const extracted = nameLineMatch[1].trim();
    if (extracted.length > 2 && !extracted.match(/^(название|идеи|идея|продукта|продукт)$/i)) {
      name = extracted;
    }
  }
  
  if (name === 'Продукт') {
    const boldMatch = ideaText.match(/\*\*([^*]{3,50})\*\*/);
    if (boldMatch && boldMatch[1]) {
      const extracted = boldMatch[1].trim();
      if (!extracted.match(/^(название|идеи|идея|продукта|продукт)$/i)) {
        name = extracted;
      }
    }
  }
  
  const descPatterns = [
    /(?:Описание сути|Описание)[^:]*:?\s*([^\n]+(?:\n[^\n#]+)*?)(?=\n###|\n##|$)/i,
  ];
  
  for (const pattern of descPatterns) {
    const match = ideaText.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (extracted.length > 10) {
        description = extracted.substring(0, 150);
        break;
      }
    }
  }
  
  return { name, description };
}

export default function UXPipelineApp() {
  const [inputText, setInputText] = useState('');
  const [transcriptionFile, setTranscriptionFile] = useState<File | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(-1);
  const [stageResults, setStageResults] = useState<StageResult[]>([]);
  const [activeResultTab, setActiveResultTab] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [githubRepoUrl, setGithubRepoUrl] = useState<string | null>(null);
  const [vercelUrl, setVercelUrl] = useState<string | null>(null);
  const [accessibilityScore, setAccessibilityScore] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Store original source text for all stages (doesn't get cleared)
  const [sourceText, setSourceText] = useState<string>('');
  
  // Stage-specific input texts (except prototype)
  const [stageInputTexts, setStageInputTexts] = useState<Record<string, string>>({});
  
  // Stop generation - use STATE for UI updates + ref for async checks
  const [isStopped, setIsStopped] = useState(false);
  const stopGenerationRef = useRef(false);
  
  // Abort controller for cancelling fetch requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Formed idea summary for display
  const [formedIdeaSummary, setFormedIdeaSummary] = useState<{ name: string; description: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stageResults, currentStage]);

  const handleFileUpload = async (file: File) => {
    setTranscriptionFile(file);
    const text = await file.text();
    setTranscriptionText(text);
  };

  const handleRemoveFile = () => {
    setTranscriptionFile(null);
    setTranscriptionText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Publish prototype to GitHub
  const publishToGitHub = async (htmlContent: string, productName: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent,
          productName,
          readme: `# ${productName}\n\nАвтоматически сгенерированный прототип от IntuiUX Agent.\n\n## Просмотр\nОткройте файл \`index.html\` в браузере.\n\n---\nСоздано с помощью IntuiUX Agent`
        })
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Error publishing to GitHub:', error);
      return null;
    }
  };

  // Build prompt for each stage
  const buildPrompt = useCallback((
    stageId: string, 
    sourceText: string, 
    formedIdea: string, 
    previousContext: string,
    refinement?: string
  ): string => {
    const ideaSection = formedIdea ? `
═══════════════════════════════════════════════════════════════
🎯 СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА (ОСНОВА ДЛЯ ВСЕХ АРТЕФАКТОВ):
${formedIdea}
═══════════════════════════════════════════════════════════════

` : '';

    const prompts: Record<string, string> = {
      idea: `Проанализируй текст и сформулируй ЧЁТКУЮ ИДЕЮ продукта.

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Извлеки идею ИМЕННО ИЗ ЭТОГО ТЕКСТА
- НЕ используй шаблоны или абстрактные примеры
- Все данные бери ТОЛЬКО из исходного текста
- НЕ придумывай - анализируй контекст

Структура ответа:

## 💡 Название идеи
[Чёткое название в 2-4 слова из контекста текста]

### Описание сути
[Что это за продукт, какую проблему решает - из текста]

### Use Cases (Сценарии использования)
[Конкретные сценарии использования продукта, извлечённые из текста]

### Целевая аудитория и типы пользователей
[Портрет пользователя, роли в системе - из контекста]

### Ключевая ценность (Value Proposition)
[Главное преимущество продукта - из текста]

### Основные функции
1. [Функция 1 - из контекста]
2. [Функция 2 - из контекста]
3. [Функция 3 - из контекста]

### Риски реализации (взгляд маркетолога-критика)
[Конкретные риски для ЭТОЙ идеи на основе анализа рынка]

### Трудности реализации
[Реальные сложности, с которыми столкнётся продукт]

### Рекомендации по оптимизации идеи
**Улучшение ценности:**
[Конкретные предложения как усилить ценность для пользователя]

**Дифференциация:**
[Какое уникальное преимущество выделит продукт среди конкурентов - на основе анализа аналогов]

### Итоговая оценка
[Общая оценка потенциала идеи]

Исходный текст:
${sourceText}`,

      competitors: `${ideaSection}Проведи ПОЛНОЦЕННЫЙ конкурентный анализ ДЛЯ ЭТОЙ КОНКРЕТНОЙ ИДЕИ.

## 1. ПРЯМЫЕ КОНКУРЕНТЫ (3 продукта)
- Название и URL
- Основные функции
- Ценовая модель
- Сильные/слабые стороны

## 2. КОСВЕННЫЕ КОНКУРЕНТЫ (3 продукта)
- Название и описание
- Как решает проблему иначе

## 3. СРАВНИТЕЛЬНАЯ ТАБЛИЦА (Mermaid)

## 4. ВОЗМОЖНОСТИ ДИФФЕРЕНЦИАЦИИ`,

      cjm: `${ideaSection}Создай ДЕТАЛЬНУЮ Customer Journey Map ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

**Контекст для анализа (ИСПОЛЬЗУЙ ЭТИ ДАННЫЕ):**
${previousContext}

⚠️ КРИТИЧЕСКИ ВАЖНО:
- Используй ТОЛЬКО данные из "СФОРМИРОВАННАЯ ИДЕЯ ПРОДУКТА" и контекста выше
- Анализируй КОНКРЕТНЫЙ продукт — его функции, ЦА, ценности
- Используй инсайты из конкурентного анализа (если есть)
- НЕ используй шаблоны — каждый этап должен отражать специфику ЭТОГО продукта
- Действия пользователя должны быть связаны с функциями продукта

## 1. ОПРЕДЕЛЕНИЕ РОЛЕЙ ПОЛЬЗОВАТЕЛЕЙ
Определи все роли пользователей на основе ЦА из Идеи (если их несколько - создай CJM для каждой):
- Роль 1: [название] — [краткое описание из контекста]
- Роль 2: [название] — [краткое описание из контекста]
...

## 2. CJM ДЛЯ КАЖДОЙ РОЛИ (отдельные секции)

### CJM для [Роль 1]

\`\`\`mermaid
journey
    title Customer Journey: [Роль 1] в [Название продукта]
    section Этап 1 (связанный с функцией продукта)
      Действие 1 (конкретное для этого продукта): 3: Пользователь
      Действие 2 (конкретное для этого продукта): 4: Пользователь
    section Этап 2
      ...
\`\`\`

**Детальное описание этапов:**

| Этап | Действие | Цель | Touchpoints | Эмоция | Боли | Возможности |
|------|----------|------|-------------|---------|------|-------------|
| ... | ... | ... | ... | ... | ... | ... |

### CJM для [Роль 2]
... (аналогичная структура)

## 3. КРИТИЧЕСКИЕ ТОЧКИ И БОЛИ
На основе анализа конкурентов (если есть) и специфики продукта:
- Боль 1: [описание конкретной боли для ЭТОГО продукта] → Решение: [предложение]
- ...

## 4. КЛЮЧЕВЫЕ ИНСАЙТЫ ДЛЯ ДИЗАЙНА
На основе всего контекста:
- Инсайт 1: [связанный с функциями и ценностями продукта]
- ...`,

      ia: `${ideaSection}Создай Информационную архитектуру ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Предыдущий контекст:
${previousContext}

## 1. Структура продукта (Mermaid mindmap)
## 2. Таксономия сущностей
## 3. ER-диаграмма (Mermaid erDiagram)
## 4. Навигационная структура
## 5. Описание страниц`,

      userflow: `${ideaSection}Создай детальные пользовательские сценарии ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Предыдущий контекст:
${previousContext}

## 1. Основной сценарий (Happy Path) - Mermaid flowchart
## 2. Альтернативные сценарии (3)
## 3. Edge cases
## 4. Описание экранов`,

      prototype: `${ideaSection}Создай ПОЛНЫЙ, ИНТЕРАКТИВНЫЙ HTML прототип ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Предыдущий контекст:
${previousContext}

ДИЗАЙН:
- Тёмный фон: #0a0a0f
- Акценты: #f5b942
- Tailwind CSS CDN
- Яндекс.Метрика

Верни ПОЛНЫЙ HTML код.`,

      invitation: `${ideaSection}Создай скрипт приглашения на тестирование ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

Прототип: ${githubRepoUrl || 'ссылка будет добавлена'}

## 1. Email-приглашение
## 2. Telegram/WhatsApp
## 3. Пост для соцсетей
## 4. Профиль участника
## 5. Форма записи`,

      guideline: `${ideaSection}Создай ГАЙДЛАЙН юзабилити-тестирования ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

## 1. Подготовка
## 2. Структура сессии (тайминг)
## 3. Скрипт модератора
## 4. Задачи для тестирования (5 конкретных задач)
## 5. Пост-тест интервью
## 6. Чек-лист наблюдателя
## 7. Шаблон протокола`,

      metrics: `${ideaSection}Определи продуктовые метрики ДЛЯ ЭТОГО КОНКРЕТНОГО ПРОДУКТА.

## 1. Северная метрика (North Star)
## 2. Acquisition метрики
## 3. Activation метрики
## 4. Retention метрики
## 5. Revenue метрики (если применимо)
## 6. Referral метрики
## 7. Продуктовые метрики
## 8. Рекомендации по отслеживанию`
    };
    
    let prompt = prompts[stageId] || '';
    
    if (refinement) {
      prompt += `\n\nДОПОЛНИТЕЛЬНОЕ УТОЧНЕНИЕ ОТ ПОЛЬЗОВАТЕЛЯ:\n${refinement}`;
    }
    
    return prompt;
  }, [githubRepoUrl]);

  // Process competitors stage with real web search
  const processCompetitorsStage = useCallback(async (
    formedIdea: string,
    refinement?: string
  ): Promise<{ response: string; isError?: boolean }> => {
    console.log('[CompetitorsStage] Starting real web search...');
    
    try {
      // Parse user's refinement to extract competitor names
      let userCompetitors: string[] = [];
      if (refinement) {
        // Try to extract competitor names from refinement
        const lines = refinement.split(/[,\n]/);
        userCompetitors = lines
          .map(l => l.trim())
          .filter(l => l.length > 2 && !l.startsWith('-') && !l.startsWith('•'))
          .slice(0, 5);
      }
      
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds for web search
      
      const res = await fetch('/api/competitors-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: formedIdea,
          correction: refinement,
          userCompetitors
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      
      if (stopGenerationRef.current) {
        return { 
          response: `## ⏹️ Остановлено пользователем`, 
          isError: true 
        };
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.analysis) {
        return { response: data.analysis };
      }
      
      throw new Error(data.error || 'Ошибка поиска конкурентов');
    } catch (error) {
      if ((error as Error).name === 'AbortError' || stopGenerationRef.current) {
        return { 
          response: `## ⏹️ Остановлено пользователем`, 
          isError: true 
        };
      }
      
      console.error('[CompetitorsStage] Error:', error);
      return { 
        response: `## ⚠️ Ошибка поиска конкурентов\n\n${(error as Error).message}\n\nНажмите "Перегенерировать" чтобы попробовать снова.`, 
        isError: true 
      };
    }
  }, []);

  // Process single stage
  const processStage = useCallback(async (
    stageIndex: number,
    sourceText: string,
    formedIdea: string,
    previousContext: string,
    conversationId: string | null,
    refinement?: string
  ): Promise<{ response: string; conversationId: string | null; isError?: boolean }> => {
    const stage = PIPELINE_STAGES[stageIndex];
    
    // Special handling for competitors stage - use real web search
    if (stage.id === 'competitors') {
      const result = await processCompetitorsStage(formedIdea, refinement);
      return { 
        response: result.response, 
        conversationId: null, 
        isError: result.isError 
      };
    }
    
    const prompt = buildPrompt(stage.id, sourceText, formedIdea, previousContext, refinement);
    
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Check if generation was stopped
      if (stopGenerationRef.current) {
        throw new Error('Generation stopped by user');
      }
      
      try {
        // Create new AbortController for this request
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentType: stage.agent,
            message: prompt,
            conversationId
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        abortControllerRef.current = null;

        // Check if stopped while waiting for response
        if (stopGenerationRef.current) {
          return { 
            response: `## ⏹️ Остановлено пользователем`, 
            conversationId: null,
            isError: true
          };
        }

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error');
          console.error(`API error ${res.status}: ${errorText.substring(0, 200)}`);
          
          if (res.status === 502 || res.status === 504) {
            lastError = new Error(`Gateway error ${res.status}, retrying...`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Non-JSON response:', text.substring(0, 500));
          throw new Error('Server returned non-JSON response');
        }

        const data = await res.json();
        
        if (data.success && data.response) {
          return { response: data.response, conversationId: data.conversationId };
        }
        
        throw new Error(data.error || 'Ошибка обработки');
      } catch (error) {
        // If aborted by user, return immediately
        if ((error as Error).name === 'AbortError' || stopGenerationRef.current) {
          return { 
            response: `## ⏹️ Остановлено пользователем`, 
            conversationId: null,
            isError: true
          };
        }
        
        lastError = error as Error;
        console.error(`Error in processStage for ${stage.id} (attempt ${attempt}):`, error);
        
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    
    // Return error with flag to mark stage as failed
    return { 
      response: `## ⚠️ Ошибка обработки этапа "${stage.fullName}"\n\n${lastError?.message || 'Неизвестная ошибка'}\n\nНажмите \"Перегенерировать\" чтобы попробовать снова.`, 
      conversationId: null,
      isError: true
    };
  }, [buildPrompt, processCompetitorsStage]);

  // Main pipeline processing
  const processPipeline = useCallback(async (startIndex: number = 0) => {
    // Get source text - either from saved state or current input
    const fullText = sourceText || transcriptionText || inputText.trim();
    console.log('processPipeline called with startIndex:', startIndex, 'fullText length:', fullText?.length || 0);
    
    if (!fullText) {
      console.log('No source text, returning');
      return;
    }

    setIsProcessing(true);
    stopGenerationRef.current = false;
    setIsStopped(false);
    
    if (startIndex === 0) {
      // Save source text for future stages
      setSourceText(fullText);
      setCurrentStage(0);
      setGithubRepoUrl(null);
      setStageResults(PIPELINE_STAGES.map(stage => ({
        id: stage.id,
        name: stage.name,
        status: 'pending',
        content: ''
      })));
    }

    let conversationId = null;
    let formedIdea = stageResults[0]?.content || '';
    let allResults: string[] = [];

    // Build allResults from completed stages
    for (let i = 0; i < startIndex; i++) {
      const result = stageResults[i];
      if (result?.content) {
        allResults.push(`=== ${PIPELINE_STAGES[i].fullName.toUpperCase()} ===\n${result.content}`);
      }
    }

    // Process ONLY ONE stage at a time - user must click "Send forward" to continue
    const i = startIndex;
    
    // Check if stopped - CRITICAL CHECK
    if (stopGenerationRef.current) {
      console.log('STOP DETECTED at start of stage', i);
      return;
    }
    
    // Check if this stage is already completed or processing
    if (stageResults[i]?.status === 'completed') {
      console.log('Stage already completed, skipping');
      return;
    }
    
    const stage = PIPELINE_STAGES[i];
    setCurrentStage(i);
    
    setStageResults(prev => prev.map((r, idx) => 
      idx === i ? { ...r, status: 'processing' } : r
    ));
    
    // Small delay to allow UI to update and check stop flag
    await new Promise(r => setTimeout(r, 100));
    if (stopGenerationRef.current) {
      console.log('STOP DETECTED after status update');
      setStageResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'error', content: '⏹️ Остановлено пользователем' } : r
      ));
      setIsProcessing(false);
      return;
    }

    try {
      const previousContext = allResults.join('\n\n');
      
      // Check for stage-specific input
      const stageInput = stageInputTexts[stage.id] || '';
      
      const result = await processStage(
        i, 
        fullText, 
        formedIdea, 
        previousContext,
        conversationId,
        stageInput
      );
      conversationId = result.conversationId;
      
      // If user stopped generation, exit immediately
      if (stopGenerationRef.current) {
        console.log('STOP DETECTED after processStage');
        setStageResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', content: '⏹️ Остановлено пользователем' } : r
        ));
        setIsProcessing(false);
        return;
      }
      
      if (stage.id === 'idea' && !result.isError) {
        formedIdea = result.response;
        setFormedIdeaSummary(extractIdeaSummary(result.response));
      }
      
      let githubUrl = null;
      
      if (stage.id === 'prototype') {
        setIsPublishing(true);
        const htmlMatch = result.response.match(/```html\n([\s\S]*?)\n```/);
        const html = htmlMatch ? htmlMatch[1] : result.response;
        const productName = extractProductName(formedIdea);
        
        // Deploy to Vercel (via our API)
        try {
          const deployRes = await fetch('/api/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productName,
              htmlContent: html
            })
          });
          const deployData = await deployRes.json();
          if (deployData.success && deployData.deployment) {
            setVercelUrl(deployData.deployment.url);
            setAccessibilityScore(deployData.deployment.accessibilityScore);
            console.log('[Prototype] Deployed to:', deployData.deployment.url);
          }
        } catch (deployError) {
          console.error('[Prototype] Deploy error:', deployError);
        }
        
        // Also publish to GitHub
        githubUrl = await publishToGitHub(html, productName);
        if (githubUrl) setGithubRepoUrl(githubUrl);
        setIsPublishing(false);
      }
      
      // Check if stage had an error
      const stageStatus = result.isError ? 'error' : 'completed';
      setStageResults(prev => prev.map((r, idx) => 
        idx === i ? { 
          ...r, 
          status: stageStatus, 
          content: result.response,
          githubUrl: githubUrl || undefined
        } : r
      ));
      
      setActiveResultTab(stage.id);
      
    } catch (error) {
      console.error(`Error in stage ${stage.id}:`, error);
      // Check if it was a user abort
      if (stopGenerationRef.current) {
        setStageResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', content: '⏹️ Остановлено пользователем' } : r
        ));
      } else {
        setStageResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', content: 'Ошибка при обработке' } : r
        ));
      }
    }

    // STOP HERE - wait for user to click "Send forward"
    setIsProcessing(false);
    setCurrentStage(-1);
    if (startIndex === 0) {
      setInputText('');
      handleRemoveFile();
    }
    setZoomLevel(100);
  }, [sourceText, transcriptionText, inputText, stageResults, stageInputTexts, processStage]);

  // Stop generation - IMMEDIATE stop
  const handleStopGeneration = () => {
    console.log('STOP PRESSED');
    stopGenerationRef.current = true;
    setIsStopped(true);
    setIsProcessing(false);
    setCurrentStage(-1);
    
    // Abort any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Mark current processing stage as stopped
    setStageResults(prev => prev.map((r) => 
      r.status === 'processing' ? { ...r, status: 'error', content: '⏹️ Остановлено пользователем' } : r
    ));
  };

  // Continue from specific stage with user input
  const handleSendToNextStage = async (currentStageId: string) => {
    console.log('handleSendToNextStage called with:', currentStageId);
    
    const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === currentStageId);
    console.log('currentIndex:', currentIndex);
    
    if (currentIndex < 0) return;
    
    // Reset stop flag before continuing
    stopGenerationRef.current = false;
    setIsStopped(false);
    
    // Get the current stage content and any user input
    const currentResult = stageResults[currentIndex];
    const userInput = stageInputTexts[currentStageId] || '';
    
    // Append user input to the content if provided
    if (userInput.trim() && currentResult) {
      const updatedContent = currentResult.content + `\n\n---\n**Дополнительные уточнения:**\n${userInput}`;
      setStageResults(prev => prev.map((r, idx) => 
        idx === currentIndex ? { ...r, content: updatedContent } : r
      ));
    }
    
    // Start processing from next stage
    const nextIndex = currentIndex + 1;
    console.log('nextIndex:', nextIndex, 'PIPELINE_STAGES.length:', PIPELINE_STAGES.length);
    
    if (nextIndex < PIPELINE_STAGES.length) {
      // Clear input for this stage
      setStageInputTexts(prev => ({ ...prev, [currentStageId]: '' }));
      console.log('Calling processPipeline with startIndex:', nextIndex);
      await processPipeline(nextIndex);
    }
  };

  // Regenerate current stage with input
  const handleRegenerateStage = async (stageId: string) => {
    const stageIndex = PIPELINE_STAGES.findIndex(s => s.id === stageId);
    if (stageIndex < 0) return;
    
    const userInput = stageInputTexts[stageId] || '';
    
    // Get formed idea
    const formedIdea = stageResults[0]?.content || '';
    
    // Build previous context
    const previousContext = stageResults
      .slice(0, stageIndex)
      .map(r => `=== ${PIPELINE_STAGES.find(s => s.id === r.id)?.fullName?.toUpperCase()} ===\n${r.content}`)
      .join('\n\n');
    
    setStageResults(prev => prev.map((r, idx) => 
      idx === stageIndex ? { ...r, status: 'processing' } : r
    ));
    
    const sourceText = transcriptionText || inputText;
    
    try {
      const result = await processStage(stageIndex, sourceText, formedIdea, previousContext, null, userInput);
      
      const stageStatus = result.isError ? 'error' : 'completed';
      setStageResults(prev => prev.map((r, idx) => 
        idx === stageIndex ? { ...r, status: stageStatus, content: result.response } : r
      ));
      
      if (stageId === 'idea' && !result.isError) {
        setFormedIdeaSummary(extractIdeaSummary(result.response));
      }
      
      // Clear input
      setStageInputTexts(prev => ({ ...prev, [stageId]: '' }));
      
    } catch (error) {
      console.error('Error regenerating stage:', error);
      setStageResults(prev => prev.map((r, idx) => 
        idx === stageIndex ? { ...r, status: 'error', content: 'Ошибка при обработке. Попробуйте снова.' } : r
      ));
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadHTML = (content: string) => {
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    const html = htmlMatch ? htmlMatch[1] : content;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prototype.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProgress = () => {
    if (currentStage < 0) return 0;
    const completed = stageResults.filter(r => r.status === 'completed').length;
    return (completed / PIPELINE_STAGES.length) * 100;
  };

  const resetPipeline = () => {
    setStageResults([]);
    setActiveResultTab(null);
    setCurrentStage(-1);
    setZoomLevel(100);
    setGithubRepoUrl(null);
    setVercelUrl(null);
    setAccessibilityScore(null);
    setFormedIdeaSummary(null);
    setStageInputTexts({});
    setSourceText('');
    stopGenerationRef.current = false;
    setIsStopped(false);
    setIsProcessing(false);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleZoomReset = () => {
    setZoomLevel(100);
    setPanPosition({ x: 0, y: 0 });
  };

  // Pan handlers for CJM
  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeResultTab !== 'cjm') return;
    setIsPanning(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPanStart({ x: clientX - panPosition.x, y: clientY - panPosition.y });
  };

  const handlePanMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning || activeResultTab !== 'cjm') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPanPosition({
      x: clientX - panStart.x,
      y: clientY - panStart.y
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  // Download CJM as PDF
  const downloadCJMAsPDF = async () => {
    const content = stageResults.find(r => r.id === 'cjm')?.content || '';
    if (!content) return;

    try {
      // Dynamic import
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Find the content element
      const element = document.querySelector('[data-cjm-content]') as HTMLElement;
      if (!element) {
        console.error('CJM content element not found');
        return;
      }

      // Store original styles
      const originalMaxHeight = element.style.maxHeight;
      const originalOverflow = element.style.overflow;
      
      // Remove scroll for capture
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';

      // Capture
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0d0d14',
        logging: false
      });

      // Restore styles
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      
      // Get product name for filename
      const productName = formedIdeaSummary?.name || 'CJM';
      const filename = `CJM-${productName.replace(/\s+/g, '-')}.pdf`;
      
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Check if we can continue from this stage
  const canContinueFromStage = (stageId: string) => {
    const idx = PIPELINE_STAGES.findIndex(s => s.id === stageId);
    const result = stageResults[idx];
    const isLast = idx === PIPELINE_STAGES.length - 1;
    const isCompleted = result?.status === 'completed';
    
    console.log(`canContinueFromStage(${stageId}): idx=${idx}, isCompleted=${isCompleted}, isLast=${isLast}`);
    
    // Can continue if this stage is completed and not the last one
    return idx >= 0 && !isLast && isCompleted;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">IntuiUX Agent</h1>
                <p className="text-xs text-gray-500 hidden sm:block">От идеи → до прототипа на GitHub</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Stop button - always visible when processing */}
              {isProcessing && (
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleStopGeneration}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Стоп
                </Button>
              )}
              
              {/* New analysis button - only when not processing */}
              {stageResults.length > 0 && !isProcessing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetPipeline}
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Новый анализ
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        {stageResults.length === 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                9 этапов → прототип на GitHub
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ваша идея → Готовый прототип
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Опишите идею продукта, и AI создаст все артефакты для её реализации
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить файл
                </Button>
                
                {transcriptionFile && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-300 max-w-[200px] truncate">
                      {transcriptionFile.name}
                    </span>
                    <button onClick={handleRemoveFile} className="w-5 h-5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center">
                      <X className="w-3 h-3 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>

              <Textarea
                placeholder={transcriptionText ? "Текст загружен из файла..." : "Опишите вашу идею продукта..."}
                value={transcriptionText ? '' : inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!!transcriptionText}
                className="min-h-[200px] bg-[#0d0d14] border-white/10 focus:border-amber-500/50 text-white placeholder:text-gray-600 resize-none"
              />

              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-500">
                {PIPELINE_STAGES.slice(0, 6).map((stage, idx) => {
                  const IconComponent = stage.icon;
                  return (
                    <div key={stage.id} className="flex items-center gap-1">
                      <div className={`w-5 h-5 rounded bg-gradient-to-br ${stage.color} flex items-center justify-center`}>
                        <IconComponent className="w-3 h-3 text-white" />
                      </div>
                      <span>{stage.name}</span>
                      {idx < 5 && <ArrowRight className="w-3 h-3" />}
                    </div>
                  );
                })}
                <span>+ ещё 3 этапа</span>
              </div>

              <Button
                onClick={() => processPipeline(0)}
                disabled={(!inputText.trim() && !transcriptionText) || isProcessing}
                className="w-full mt-6 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {isPublishing ? 'Публикация...' : 'Обработка...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Создать прототип и выложить на GitHub
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {(isProcessing || isStopped) && stageResults.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  {isStopped ? '⏹️ Остановлено' : isPublishing ? 'Публикация на GitHub' : 'Обработка'}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {stageResults.filter(r => r.status === 'completed').length} / {PIPELINE_STAGES.length}
                  </span>
                  {isProcessing && (
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={handleStopGeneration}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Стоп
                    </Button>
                  )}
                </div>
              </div>
              <Progress value={getProgress()} className="h-2 bg-white/10" />
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-amber-400">
                  {isStopped ? 'Обработка остановлена' : isPublishing ? 'Загрузка прототипа...' : 
                   currentStage >= 0 ? PIPELINE_STAGES[currentStage]?.fullName : 'Подготовка...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GitHub URL Banner */}
        {githubRepoUrl && !isProcessing && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-medium text-white">Прототип опубликован!</p>
                  <p className="text-sm text-gray-400 truncate max-w-[300px]">{githubRepoUrl}</p>
                </div>
              </div>
              <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors">
                <ExternalLink className="w-4 h-4" />
                Открыть
              </a>
            </div>
          </div>
        )}

        {/* Results Section */}
        {stageResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-2">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const result = stageResults[idx];
                  const IconComponent = stage.icon;
                  
                  return (
                    <button
                      key={stage.id}
                      onClick={() => result?.status === 'completed' && setActiveResultTab(stage.id)}
                      disabled={result?.status !== 'completed'}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        activeResultTab === stage.id 
                          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30' 
                          : result?.status === 'completed'
                            ? 'hover:bg-white/5 cursor-pointer border border-transparent'
                            : 'opacity-50 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center shrink-0`}>
                        {result?.status === 'processing' ? (
                          <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        ) : result?.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : result?.status === 'error' ? (
                          <Circle className="w-4 h-4 text-red-400" />
                        ) : (
                          <IconComponent className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate">{stage.name}</div>
                        <div className="text-xs text-gray-500">
                          {result?.status === 'processing' ? 'Обработка...' : result?.status === 'completed' ? 'Готово' : 'Ожидание'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeResultTab && (
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                  {/* Idea Banner */}
                  {formedIdeaSummary && activeResultTab !== 'idea' && (
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-amber-300">{formedIdeaSummary.name}</p>
                          {formedIdeaSummary.description && (
                            <p className="text-xs text-gray-400 truncate">{formedIdeaSummary.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Header */}
                  <div className="border-b border-white/10 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const stage = PIPELINE_STAGES.find(s => s.id === activeResultTab);
                            const IconComponent = stage?.icon || Sparkles;
                            return (
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stage?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                            );
                          })()}
                          <div>
                            <h3 className="font-semibold text-white">
                              {PIPELINE_STAGES.find(s => s.id === activeResultTab)?.fullName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {PIPELINE_STAGES.find(s => s.id === activeResultTab)?.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          {(activeResultTab === 'cjm' || activeResultTab === 'ia') && (
                            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                              <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                <ZoomOut className="w-4 h-4" />
                              </Button>
                              <span className="text-xs text-gray-400 px-2">{zoomLevel}%</span>
                              <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                <ZoomIn className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleZoomReset} className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                <Maximize2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          {activeResultTab === 'cjm' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={downloadCJMAsPDF}
                              className="border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm" onClick={() => {
                            const content = stageResults.find(r => r.id === activeResultTab)?.content || '';
                            copyToClipboard(content, activeResultTab);
                          }} className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                            {copiedCode === activeResultTab ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                            Копировать
                          </Button>
                          
                          {activeResultTab === 'prototype' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => downloadHTML(stageResults.find(r => r.id === 'prototype')?.content || '')} className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400">
                                <Download className="w-4 h-4 mr-2" />
                                Скачать
                              </Button>
                              {vercelUrl && (
                                <a href={vercelUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Открыть прототип
                                  </Button>
                                </a>
                              )}
                              {accessibilityScore !== null && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                  <span className="text-xs text-gray-400">Доступность:</span>
                                  <span className={`text-sm font-semibold ${accessibilityScore >= 80 ? 'text-green-400' : accessibilityScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {accessibilityScore}/100
                                  </span>
                                </div>
                              )}
                              {githubRepoUrl && (
                                <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400">
                                    <Github className="w-4 h-4 mr-2" />
                                    GitHub
                                  </Button>
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div 
                    className="p-4 sm:p-6 overflow-auto max-h-[50vh]"
                    style={{ 
                      transform: (activeResultTab === 'cjm' || activeResultTab === 'ia') ? `scale(${zoomLevel / 100}) translate(${panPosition.x}px, ${panPosition.y}px)` : undefined,
                      transformOrigin: 'top left',
                      cursor: activeResultTab === 'cjm' ? (isPanning ? 'grabbing' : 'grab') : 'default'
                    }}
                    data-cjm-content={activeResultTab === 'cjm' ? 'true' : undefined}
                    onMouseDown={activeResultTab === 'cjm' ? handlePanStart : undefined}
                    onMouseMove={activeResultTab === 'cjm' ? handlePanMove : undefined}
                    onMouseUp={activeResultTab === 'cjm' ? handlePanEnd : undefined}
                    onMouseLeave={activeResultTab === 'cjm' ? handlePanEnd : undefined}
                    onTouchStart={activeResultTab === 'cjm' ? handlePanStart : undefined}
                    onTouchMove={activeResultTab === 'cjm' ? handlePanMove : undefined}
                    onTouchEnd={activeResultTab === 'cjm' ? handlePanEnd : undefined}
                  >
                    <MessageContent 
                      content={stageResults.find(r => r.id === activeResultTab)?.content || ''} 
                    />
                  </div>
                  
                  {/* Stage Input and Actions */}
                  <div className="border-t border-white/10 p-4 sm:p-6 bg-white/[0.02]">
                    <div className="space-y-3">
                      <Textarea
                        placeholder={activeResultTab === 'prototype' 
                          ? "Введите уточняющий промпт для доработки прототипа (например: 'Добавить тёмную тему', 'Изменить навигацию', 'Добавить экран профиля')..."
                          : stageResults.find(r => r.id === activeResultTab)?.status === 'error' 
                            ? "Опишите что нужно исправить и нажмите 'Перегенерировать'..." 
                            : "Введите уточнения или дополнительные требования для этого этапа..."}
                        value={stageInputTexts[activeResultTab] || ''}
                        onChange={(e) => setStageInputTexts(prev => ({ ...prev, [activeResultTab]: e.target.value }))}
                        className="min-h-[80px] bg-[#0d0d14] border-white/10 focus:border-amber-500/50 text-white placeholder:text-gray-600 resize-none"
                      />
                      
                      <div className="flex gap-2 flex-wrap">
                        {activeResultTab === 'prototype' ? (
                          <>
                            {/* Prototype-specific buttons */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegenerateStage(activeResultTab)}
                              disabled={isProcessing || !stageInputTexts[activeResultTab]?.trim()}
                              className="border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Генерация...
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Исполнить промпт
                                </>
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              onClick={() => handleSendToNextStage(activeResultTab)}
                              disabled={isProcessing}
                              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Отправить дальше
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Standard stage buttons */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegenerateStage(activeResultTab)}
                              disabled={isProcessing}
                              className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Обработка...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Перегенерировать
                                </>
                              )}
                            </Button>
                            
                            {canContinueFromStage(activeResultTab) && (
                              <Button
                                size="sm"
                                onClick={() => handleSendToNextStage(activeResultTab)}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Отправить дальше
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            IntuiUX Agent — AI-powered UX Pipeline
          </p>
        </div>
      </footer>
      
      <div ref={resultsEndRef} />
    </div>
  );
}
