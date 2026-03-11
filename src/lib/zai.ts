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
function loadConfig(): ZAIConfig {
  const homeDir = os.homedir();
  const configPaths = [
    path.join(process.cwd(), '.z-ai-config'),
    path.join(homeDir, '.z-ai-config'),
    '/etc/.z-ai-config',
    '/tmp/.z-ai-config'
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
  throw new Error('ZAI configuration not found. Please create .z-ai-config file.');
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
