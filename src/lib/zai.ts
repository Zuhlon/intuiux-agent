import fs from 'fs';
import path from 'path';
import os from 'os';

interface ZAIConfig {
  baseUrl: string;
  apiKey: string;
  chatId?: string;
  userId?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  max_tokens?: number;
  thinking?: { type: string };
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Загружаем конфигурацию (SDK style)
// Priority: 1. Environment variables, 2. Config files
function loadConfig(): ZAIConfig {
  // Priority 1: Environment variables (for Vercel, Docker, etc.)
  const envBaseUrl = process.env.ZAI_BASE_URL || process.env.NEXT_PUBLIC_ZAI_BASE_URL;
  const envApiKey = process.env.ZAI_API_KEY || process.env.NEXT_PUBLIC_ZAI_API_KEY;
  
  if (envBaseUrl && envApiKey) {
    console.log('[ZAI] Config loaded from environment variables');
    return {
      baseUrl: envBaseUrl,
      apiKey: envApiKey,
    };
  }
  
  // Priority 2: Config files (for local development)
  // Skip file system on Vercel/edge runtime
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  
  if (!isVercel && typeof fs !== 'undefined') {
    const homeDir = os.homedir();
    const configPaths = [
      path.join(process.cwd(), '.z-ai-config'),
      path.join(homeDir, '.z-ai-config'),
      '/etc/.z-ai-config',
      '/tmp/.z-ai-config',
    ];
    
    for (const filePath of configPaths) {
      try {
        if (fs.existsSync(filePath)) {
          const configStr = fs.readFileSync(filePath, 'utf-8');
          const config = JSON.parse(configStr);
          if (config.baseUrl && config.apiKey) {
            console.log(`[ZAI] Config loaded from: ${filePath}`);
            return config;
          }
        }
      } catch (error) {
        console.error(`[ZAI] Error reading config from ${filePath}:`, error);
      }
    }
  }
  
  // No config found
  const errorMsg = envBaseUrl || envApiKey 
    ? 'ZAI configuration incomplete. Both ZAI_BASE_URL and ZAI_API_KEY must be set.'
    : 'ZAI configuration not found. Set ZAI_BASE_URL and ZAI_API_KEY environment variables or create .z-ai-config file.';
  
  console.error(`[ZAI] ${errorMsg}`);
  throw new Error(errorMsg);
}

// LLM Class для удобного использования
export class LLM {
  private config: ZAIConfig | null = null;

  private getConfig(): ZAIConfig {
    if (!this.config) {
      this.config = loadConfig();
    }
    return this.config;
  }

  async chat(options: ChatCompletionOptions): Promise<string> {
    const config = this.getConfig();
    const url = `${config.baseUrl}/chat/completions`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Token': config.apiKey,
    };
    
    const requestBody = {
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? options.max_tokens ?? 4096,
      thinking: options.thinking || { type: 'disabled' },
    };
    
    console.log(`[ZAI] Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ZAI] API error ${response.status}: ${errorBody}`);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }
    
    const data = await response.json() as ChatCompletionResponse;
    return data.choices[0]?.message?.content || ''
  }
}

// Экспортируем для удобства
export const zai = {
  chat: {
    completions: {
      create: createChatCompletion
    }
  }
}

// Создаём chat completion с правильными заголовками
export async function createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
  const config = loadConfig();
  const url = `${config.baseUrl}/chat/completions`;
  
  // Используем X-Token header как требует API
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Token': config.apiKey
  };
  
  const requestBody = {
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? options.max_tokens ?? 4096,
    thinking: options.thinking || { type: 'disabled' }
  };
  
  console.log(`[ZAI] Making request to: ${url}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[ZAI] API error ${response.status}: ${errorBody}`);
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`)
  }
  
  return response.json()
}

// Check if LLM is configured
export function isLLMConfigured(): boolean {
  try {
    loadConfig();
    return true;
  } catch {
    return false;
  }
}
