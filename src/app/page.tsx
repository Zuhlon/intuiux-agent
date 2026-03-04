'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { MessageContent } from '@/components/MessageContent';
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  BarChart3,
  RefreshCw,
  Loader2,
  ChevronRight,
  Database,
  Users,
  Target
} from 'lucide-react';

// Типы
interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  avatar: string | null;
  isActive: boolean;
  _count?: {
    conversations: number;
    insights: number;
    knowledgeBases: number;
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  source?: string;
}

interface Metric {
  id: string;
  name: string;
  value: number;
  unit?: string;
  category: string;
}

export default function UXAgentsDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [activeTab, setActiveTab] = useState('agents');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка агентов
  useEffect(() => {
    fetchAgents();
    fetchInsights();
    fetchMetrics();
  }, []);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/insights');
      const data = await res.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Добавляем сообщение пользователя сразу
    const tempUserMsg = {
      id: 'temp-user-' + Date.now(),
      role: 'user' as const,
      content: userMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: userMessage,
          conversationId
        })
      });

      // Проверяем, что ответ валидный
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await res.json();
      
      if (data.success && data.response) {
        setConversationId(data.conversationId);
        
        // Добавляем ответ AI напрямую
        const aiMessage = {
          id: 'ai-' + Date.now(),
          role: 'assistant' as const,
          content: data.response,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Показываем ошибку
        const errorMessage = {
          id: 'error-' + Date.now(),
          role: 'assistant' as const,
          content: data.error || 'Произошла ошибка. Попробуйте ещё раз.',
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Показываем ошибку в чате
      const errorMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant' as const,
        content: 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте ещё раз.',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setConversationId(null);
    setActiveTab('chat');
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'persona': return <Users className="w-5 h-5" />;
      case 'transcription_analyst': return <MessageSquare className="w-5 h-5" />;
      case 'cjm_researcher': return <TrendingUp className="w-5 h-5" />;
      case 'ia_architect': return <Database className="w-5 h-5" />;
      case 'task_architect': return <Target className="w-5 h-5" />;
      case 'prototyper': return <Sparkles className="w-5 h-5" />;
      case 'validator': return <BarChart3 className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pain_point': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'trend': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">UX AI Agents</h1>
                <p className="text-sm text-slate-500">Динамические AI-агенты для UX-исследований</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchAgents}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {metrics.map((metric) => (
            <Card key={metric.id} className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">{metric.name}</div>
                <div className="text-2xl font-bold text-slate-900">
                  {metric.value}{metric.unit}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Agents & Insights */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agents */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5 text-violet-500" />
                  AI-Агенты
                </CardTitle>
                <CardDescription>
                  Выберите агента для диалога
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedAgent?.id === agent.id
                        ? 'bg-violet-100 border-2 border-violet-300'
                        : 'bg-white hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                          {agent.avatar || getAgentIcon(agent.type)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{agent.name}</div>
                        <div className="text-xs text-slate-500 truncate">{agent.description}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                    {agent._count && (
                      <div className="flex gap-2 mt-2 text-xs text-slate-500">
                        <span>💬 {agent._count.conversations}</span>
                        <span>💡 {agent._count.insights}</span>
                        <span>📚 {agent._count.knowledgeBases}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Инсайты
                </CardTitle>
                <CardDescription>
                  Ключевые находки и рекомендации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {insights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 bg-white rounded-lg border border-slate-200"
                      >
                        <div className="flex items-start gap-2">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-900">
                              {insight.title}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {insight.description}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(insight.priority)}`}>
                                {insight.priority}
                              </Badge>
                              {insight.source && (
                                <Badge variant="outline" className="text-xs">
                                  {insight.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Chat */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-sm h-[calc(100vh-300px)] flex flex-col">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAgent ? (
                      <>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                            {selectedAgent.avatar || getAgentIcon(selectedAgent.type)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
                          <CardDescription>{selectedAgent.description}</CardDescription>
                        </div>
                      </>
                    ) : (
                      <div>
                        <CardTitle className="text-lg">Выберите агента</CardTitle>
                        <CardDescription>Начните диалог с AI-агентом</CardDescription>
                      </div>
                    )}
                  </div>
                  {selectedAgent && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Активен
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {selectedAgent ? (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 min-h-0" style={{ maxHeight: 'calc(100vh - 380px)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-violet-500" />
                          </div>
                          <h3 className="font-medium text-slate-900 mb-2">
                            Начните диалог с {selectedAgent.name}
                          </h3>
                          <p className="text-sm text-slate-500 max-w-md">
                            Задайте вопрос о пользователях, попросите проанализировать данные или предложите гипотезу для проверки.
                          </p>
                          <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-md">
                            {selectedAgent.type === 'persona' && (
                              <>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Что ты думаешь о новом интерфейсе корзины?')}>
                                  Что ты думаешь о новом интерфейсе корзины?
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Какие у тебя основные боли при использовании продукта?')}>
                                  Какие у тебя основные боли при использовании продукта?
                                </Button>
                              </>
                            )}
                            {selectedAgent.type === 'transcription_analyst' && (
                              <>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Проанализируй эту транскрипцию разговора')}>
                                  Проанализируй транскрипцию разговора
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Выдели ключевые боли из этого текста')}>
                                  Выдели ключевые боли
                                </Button>
                              </>
                            )}
                            {selectedAgent.type === 'cjm_researcher' && (
                              <>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Построй CJM для интернет-магазина')}>
                                  Построй CJM для интернет-магазина
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Покажи воронку конверсии')}>
                                  Покажи воронку конверсии
                                </Button>
                              </>
                            )}
                            {selectedAgent.type === 'ia_architect' && (
                              <>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Построй информационную архитектуру для e-commerce')}>
                                  Построй IA для e-commerce
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Создай userflow для оформления заказа')}>
                                  Создай userflow оформления заказа
                                </Button>
                              </>
                            )}
                            {selectedAgent.type === 'task_architect' && (
                              <>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Составь ТЗ для компонента корзины')}>
                                  Составь ТЗ для корзины
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Напиши Gherkin сценарии для формы оплаты')}>
                                  Gherkin для формы оплаты
                                </Button>
                              </>
                            )}
                            {selectedAgent.type === 'prototyper' && (
                              <>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Создай HTML прототип страницы товара')}>
                                  Прототип страницы товара
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Создай прототип формы оформления заказа')}>
                                  Прототип формы заказа
                                </Button>
                              </>
                            )}
                            {selectedAgent.type === 'validator' && (
                              <>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Проверь гипотезу: упрощение формы оплаты повысит конверсию на 15%')}>
                                  Проверь гипотезу о конверсии
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => setInputMessage('Какие риски есть у нашего плана по редизайну?')}>
                                  Риски редизайна
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                  message.role === 'user'
                                    ? 'bg-violet-500 text-white'
                                    : 'bg-slate-100 text-slate-900'
                                }`}
                              >
                                {message.role === 'user' ? (
                                  <p className="text-sm whitespace-pre-wrap" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', hyphens: 'auto' }}>{message.content}</p>
                                ) : (
                                  <div className="text-sm" style={{ wordBreak: 'break-word' }}>
                                    <MessageContent content={message.content} />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {isLoading && (
                            <div className="flex justify-start">
                              <div className="bg-slate-100 rounded-2xl px-4 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Напишите сообщение..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isLoading}
                          className="bg-violet-500 hover:bg-violet-600"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                        <Bot className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="font-medium text-slate-900 mb-2">
                        Выберите AI-агента
                      </h3>
                      <p className="text-sm text-slate-500 max-w-md">
                        Выберите агента слева, чтобы начать диалог о пользователях и UX-исследованиях.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                База знаний
              </CardTitle>
              <CardDescription>
                Данные для обучения AI-агентов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-2xl font-bold text-violet-600">5</div>
                  <div className="text-sm text-slate-500">UX-тренды 2025</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-2xl font-bold text-orange-600">42%</div>
                  <div className="text-sm text-slate-500">Жалоб на навигацию</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-2xl font-bold text-green-600">67%</div>
                  <div className="text-sm text-slate-500">Уходят при сложной форме</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-2xl font-bold text-blue-600">65%</div>
                  <div className="text-sm text-slate-500">Мобильный трафик</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>Powered by Z.ai LLM</span>
            </div>
            <div>
              От артефактов к AI-агентам — методология UX 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
