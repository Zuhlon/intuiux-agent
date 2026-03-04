'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import ReactMarkdown from 'react-markdown';
import { MessageContent } from '@/components/MessageContent';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { 
  Upload, 
  Send, 
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
  Users,
  Database,
  ClipboardList,
  RefreshCw,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sitemap,
  TestTube
} from 'lucide-react';

// Pipeline stages configuration - 7 stages now (CJM and IA separated)
const PIPELINE_STAGES = [
  {
    id: 'ideas',
    name: 'Идеи',
    fullName: 'Выделение идей для реализации',
    description: 'Анализ транскрипции и выделение ключевых идей продукта',
    agent: 'transcription_analyst',
    icon: Lightbulb,
    color: 'from-amber-400 to-yellow-500'
  },
  {
    id: 'competitors',
    name: 'Конкуренты',
    fullName: 'Анализ конкурентов',
    description: 'Виртуальный конкурентный анализ рынка',
    agent: 'brand_marketer',
    icon: BarChart3,
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 'cjm',
    name: 'CJM',
    fullName: 'Customer Journey Map',
    description: 'Карта пути пользователя с эмоциональным графиком',
    agent: 'cjm_researcher',
    icon: TrendingUp,
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'ia',
    name: 'IA',
    fullName: 'Информационная архитектура',
    description: 'Структура продукта с таксономиями сущностей',
    agent: 'ia_architect',
    icon: Sitemap,
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'userflow',
    name: 'Userflow',
    fullName: 'Сценарии пользователей',
    description: 'Пользовательские сценарии и потоки',
    agent: 'ia_architect',
    icon: Users,
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'prototype',
    name: 'Прототип',
    fullName: 'Интерактивный прототип',
    description: 'HTML прототип с Яндекс.Метрикой',
    agent: 'prototyper',
    icon: Database,
    color: 'from-violet-400 to-purple-500'
  },
  {
    id: 'testing',
    name: 'Тестирование',
    fullName: 'Юзабилити-тестирование',
    description: 'Скрипт приглашения и гайдлайн проведения',
    agent: 'task_architect',
    icon: TestTube,
    color: 'from-pink-400 to-rose-500'
  }
];

interface StageResult {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  content: string;
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

  const processPipeline = async () => {
    const fullText = transcriptionText || inputText.trim();
    if (!fullText) return;

    setIsProcessing(true);
    setCurrentStage(0);
    
    setStageResults(PIPELINE_STAGES.map(stage => ({
      id: stage.id,
      name: stage.name,
      status: 'pending',
      content: ''
    })));

    let accumulatedContext = `ИСХОДНАЯ ТРАНСКРИПЦИЯ:\n${fullText}\n\n`;
    let conversationId = null;

    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      const stage = PIPELINE_STAGES[i];
      setCurrentStage(i);
      
      setStageResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'processing' } : r
      ));

      try {
        let prompt = '';
        switch (stage.id) {
          case 'ideas':
            prompt = `Проанализируй транскрипцию и выдели ключевые идеи для реализации продукта.

Для каждой идеи укажи:
1. Название идеи (кратко, 2-4 слова)
2. Описание сути (что предлагается)
3. Ценность для пользователей (зачем это нужно)
4. Приоритет (P0-критический, P1-высокий, P2-средний, P3-низкий)
5. Оценка сложности реализации (простая/средняя/сложная)

Транскрипция:
${fullText}`;
            break;
            
          case 'competitors':
            prompt = `Проведи виртуальный анализ конкурентов на основе выделенных идей.

Включи:
1. Прямые конкуренты (3-5) — аналогичные продукты с анализом функций, цен, UX
2. Косвенные конкуренты (2-3) — альтернативные решения
3. Сравнительная таблица: функции, цены, UX, сильные/слабые стороны
4. Возможности дифференциации (Mermaid mindmap)
5. Рекомендации по позиционированию

Контекст предыдущего этапа:
${accumulatedContext}`;
            break;
            
          case 'cjm':
            prompt = `Построй Customer Journey Map с эмоциональным графиком.

Включи:
1. Mermaid journey диаграмму с минимум 5 этапами
2. Для каждого этапа укажи:
   - Цель пользователя
   - Touchpoints (точки контакта)
   - Эмоциональное состояние (score 1-5)
   - Боли и барьеры
   - Возможности улучшения
3. Ключевые инсайты карты

Используй Mermaid journey синтаксис для визуализации.

Контекст:
${accumulatedContext}`;
            break;
            
          case 'ia':
            prompt = `Создай Информационную архитектуру с таксономиями сущностей.

Включи:
1. Mermaid mindmap или flowchart со структурой продукта
2. ТАКСОНОМИЯ СУЩНОСТЕЙ:
   - Пользовательские сущности (User entities)
   - Контентные сущности (Content entities)
   - Системные сущности (System entities)
   - Связи между сущностями
3. Атрибуты каждой сущности (поля, типы данных)
4. ER-диаграмма связей (Mermaid erDiagram)
5. Навигационная структура

Используй несколько Mermaid диаграмм для визуализации.

Контекст:
${accumulatedContext}`;
            break;
            
          case 'userflow':
            prompt = `Создай детальные пользовательские сценарии и userflow.

Включи:
1. Основной сценарий (Happy Path) — Mermaid flowchart
2. Альтернативные сценарии (2-3)
3. Edge cases и обработка ошибок
4. Описание экранов (цель, ключевые элементы, действия)
5. Требования к UX каждого экрана

Контекст:
${accumulatedContext}`;
            break;
            
          case 'prototype':
            prompt = `Создай ПОЛНЫЙ интерактивный HTML прототип с разметкой под Яндекс.Метрику.

ТРЕБОВАНИЯ К ДИЗАЙНУ (обязательно):
- Техно-стиль: тёмный фон (#0a0a0f, #0d0d14, #12121a)
- Текст: белый (#ffffff), серый (#a0a0a0, #6b7280)
- Акценты: медово-жёлтый (#f5b942, #ffc850), янтарный (#ff9500)
- Элементы: glassmorphism, тонкие линии (border: 1px solid rgba(255,255,255,0.1))
- Тени: box-shadow с цветом акцента
- Шрифты: Inter, system-ui, sans-serif
- Border-radius: 8px-16px

ИНТЕГРАЦИЯ ЯНДЕКС.МЕТРИКИ:
Добавь в <head>:
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(METRIKA_ID, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
   });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/METRIKA_ID" style="position:absolute; left:-9999px;" alt="" /></div></noscript>

РАЗМЕТКА ДЛЯ АНАЛИТИКИ (data-атрибуты):
- data-ym-event="event_name" — для отслеживания событий
- data-ym-goal="goal_name" — для целей
- data-ym-category="category" — категория элемента
- data-ym-label="label" — метка элемента
- data-ym-value="value" — значение

ПРИМЕРЫ РАЗМЕТКИ:
<button data-ym-event="click" data-ym-category="CTA" data-ym-label="main_cta" data-ym-goal="registration">
<a data-ym-event="navigation" data-ym-category="menu" data-ym-label="pricing">
<form data-ym-event="form_submit" data-ym-category="lead" data-ym-goal="contact_form">

ACCESSIBILITY (WCAG AA):
- Контрастность текста минимум 4.5:1
- Фокус-индикаторы (ring-2 ring-amber-400)
- aria-labels на всех интерактивных элементах
- role атрибуты для навигации
- skip-link для навигации с клавиатуры

СТРУКТУРА ПРОТОТИПА:
1. Header с навигацией (data-ym-category="navigation")
2. Hero секция с CTA (data-ym-goal="main_conversion")
3. Features секция (data-ym-category="features")
4. Целевая страница/форма (data-ym-goal="lead_generation")
5. Footer

Верни ПОЛНЫЙ HTML код с Tailwind через CDN и разметкой для аналитики.

Контекст:
${accumulatedContext}`;
            break;
            
          case 'testing':
            prompt = `Создай полный комплект для юзабилити-тестирования.

## 1. СКРИПТ ПРИГЛАШЕНИЯ УЧАСТНИКОВ
Напиши готовый скрипт для рекрутинга участников:
- Заголовок приглашения
- Введение (что тестируем)
- Описание профиля участника
- Что получит участник
- Форма записи (поля)
- Контакты для связи
- Версии для разных каналов (email, мессенджеры, соцсети)

## 2. ГАЙДЛАЙН ПРОВЕДЕНИЯ ТЕСТИРОВАНИЯ
Детальное руководство:
- Подготовка к тесту (оборудование, помещение)
- Структура сессии (тайминг по этапам)
- Скрипт модератора (вступление, задачи, завершение)
- Задачи для тестирования (3-5 задач)
- Вопросы think-aloud
- Пост-тест интервью (5-7 вопросов)
- Чек-лист наблюдателя
- Шаблон протокола

## 3. КРИТЕРИИ ОЦЕНКИ
- Количественные метрики (success rate, time on task, errors)
- Качественные метрики (SUS, NPS, удовлетворённость)
- SEVERITY rating для найденных проблем

## 4. АНАЛИЗ РЕЗУЛЬТАТОВ
- Шаблон отчёта
- Приоритизация проблем
- Рекомендации по улучшению

Контекст:
${accumulatedContext}`;
            break;
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentType: stage.agent,
            message: prompt,
            conversationId
          })
        });

        const data = await res.json();
        
        if (data.success && data.response) {
          conversationId = data.conversationId;
          accumulatedContext += `\n\n=== ${stage.fullName.toUpperCase()} ===\n${data.response}`;
          
          setStageResults(prev => prev.map((r, idx) => 
            idx === i ? { ...r, status: 'completed', content: data.response } : r
          ));
          
          setActiveResultTab(stage.id);
        } else {
          throw new Error(data.error || 'Ошибка обработки');
        }
      } catch (error) {
        console.error(`Error in stage ${stage.id}:`, error);
        setStageResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', content: 'Ошибка при обработке этапа' } : r
        ));
      }
    }

    setIsProcessing(false);
    setCurrentStage(-1);
    setInputText('');
    handleRemoveFile();
    setZoomLevel(100);
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
    a.download = 'prototype-with-analytics.html';
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
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoomLevel(100);

  // Check if current tab has Mermaid diagrams
  const hasMermaid = (content: string) => {
    return content.includes('```mermaid');
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
                <p className="text-xs text-gray-500 hidden sm:block">AI-powered UX Pipeline</p>
              </div>
            </div>
            
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
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        {stageResults.length === 0 && (
          <div className="max-w-3xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Транскрипция → Прототип за минуты
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                От идеи до прототипа
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> одним кликом</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Загрузите транскрипцию интервью или описания продукта — AI создаст полный UX пайплайн
              </p>
            </div>

            {/* Upload Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              {/* File Upload */}
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
                    <button
                      onClick={handleRemoveFile}
                      className="w-5 h-5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center transition-colors"
                      aria-label="Удалить файл"
                    >
                      <X className="w-3 h-3 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <Textarea
                placeholder={transcriptionText ? "Текст загружен из файла..." : "Или вставьте текст транскрипции / описания продукта здесь..."}
                value={transcriptionText ? '' : inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!!transcriptionText}
                className="min-h-[200px] bg-[#0d0d14] border-white/10 focus:border-amber-500/50 text-white placeholder:text-gray-600 resize-none"
              />

              {/* Pipeline Preview */}
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-500">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const IconComponent = stage.icon;
                  return (
                    <div key={stage.id} className="flex items-center gap-1">
                      <div className={`w-5 h-5 rounded bg-gradient-to-br ${stage.color} flex items-center justify-center`}>
                        <IconComponent className="w-3 h-3 text-white" />
                      </div>
                      <span>{stage.name}</span>
                      {idx < PIPELINE_STAGES.length - 1 && <ArrowRight className="w-3 h-3" />}
                    </div>
                  );
                })}
              </div>

              {/* Start Button */}
              <Button
                onClick={processPipeline}
                disabled={(!inputText.trim() && !transcriptionText) || isProcessing}
                className="w-full mt-6 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Запустить анализ
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && stageResults.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Обработка</h3>
                <span className="text-sm text-gray-400">
                  {stageResults.filter(r => r.status === 'completed').length} / {PIPELINE_STAGES.length}
                </span>
              </div>
              <Progress value={getProgress()} className="h-2 bg-white/10" />
              <p className="text-sm text-amber-400 mt-3">
                {currentStage >= 0 ? PIPELINE_STAGES[currentStage]?.fullName : 'Подготовка...'}
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {stageResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Pipeline Stages */}
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
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {stage.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result?.status === 'processing' ? 'Обработка...' :
                           result?.status === 'completed' ? 'Готово' :
                           result?.status === 'error' ? 'Ошибка' : 'Ожидание'}
                        </div>
                      </div>
                    </button>
                  );
                })}
                
                {/* Actions */}
                {!isProcessing && stageResults.every(r => r.status === 'completed') && (
                  <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
                      onClick={resetPipeline}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Новый анализ
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeResultTab && (
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                  {/* Header */}
                  <div className="border-b border-white/10 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                      
                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {/* Zoom controls for CJM and IA */}
                        {(activeResultTab === 'cjm' || activeResultTab === 'ia') && (
                          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleZoomOut}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="text-xs text-gray-400 px-2">{zoomLevel}%</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleZoomIn}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleZoomReset}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const content = stageResults.find(r => r.id === activeResultTab)?.content || '';
                            copyToClipboard(content, activeResultTab);
                          }}
                          className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                          {copiedCode === activeResultTab ? (
                            <Check className="w-4 h-4 mr-2 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          Копировать
                        </Button>
                        
                        {activeResultTab === 'prototype' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadHTML(stageResults.find(r => r.id === 'prototype')?.content || '')}
                            className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Скачать HTML
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div 
                      className="p-4 sm:p-6"
                      style={{ 
                        transform: (activeResultTab === 'cjm' || activeResultTab === 'ia') ? `scale(${zoomLevel / 100})` : 'none',
                        transformOrigin: 'top left',
                        width: (activeResultTab === 'cjm' || activeResultTab === 'ia') ? `${10000 / zoomLevel}%` : 'auto'
                      }}
                    >
                      <div className="prose prose-invert prose-sm max-w-none 
                        prose-headings:text-white prose-headings:font-semibold
                        prose-h2:text-xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                        prose-h3:text-lg prose-h3:text-gray-200
                        prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-li:text-gray-300
                        prose-strong:text-white
                        prose-code:text-amber-400 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-[#0d0d14] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:overflow-x-auto
                        prose-table:border-collapse
                        prose-th:bg-white/5 prose-th:text-white prose-th:p-3 prose-th:border prose-th:border-white/10
                        prose-td:p-3 prose-td:border prose-td:border-white/10 prose-td:text-gray-300
                        prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
                        prose-hr:border-white/10"
                      >
                        <MessageContent content={stageResults.find(r => r.id === activeResultTab)?.content || ''} />
                      </div>
                    </div>
                    <div ref={resultsEndRef} />
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span>IntuiUX Agent © 2025</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span>Powered by Z.ai LLM</span>
              <span className="text-gray-600">•</span>
              <span>Made with AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
