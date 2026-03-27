import { NextRequest, NextResponse } from 'next/server';

// Vercel API configuration
// Для работы нужно добавить VERCEL_TOKEN и VERCEL_PROJECT_ID в environment variables
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || '';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || '';

interface VercelFile {
  file: string;
  data: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { htmlContent, productName } = body;
    
    if (!htmlContent) {
      return NextResponse.json(
        { success: false, error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Если нет токена Vercel - возвращаем инструкцию
    if (!VERCEL_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Vercel token not configured',
        instructions: {
          title: 'Как настроить деплой в Vercel',
          steps: [
            '1. Создайте проект на vercel.com',
            '2. Получите токен: Account Settings → Tokens → Create Token',
            '3. Получите Project ID: Project Settings → General → Project ID',
            '4. Добавьте в .env.local:',
            '   VERCEL_TOKEN=your_token_here',
            '   VERCEL_PROJECT_ID=your_project_id',
            '   VERCEL_TEAM_ID=your_team_id (опционально)',
            '5. Перезапустите сервер'
          ],
          alternative: {
            title: 'Альтернатива: ручной деплой',
            steps: [
              '1. Скачайте HTML файл (кнопка "Скачать")',
              '2. Создайте проект на vercel.com',
              '3. Загрузите файл как Static Site',
              '4. Или подключите GitHub репозиторий Zuhlon/intuiux-agent'
            ]
          }
        }
      });
    }

    // Генерируем безопасное имя проекта
    const safeName = (productName || 'prototype')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 30) || 'prototype';

    // Создаём файлы для деплоя
    const files: VercelFile[] = [
      {
        file: 'index.html',
        data: htmlContent
      },
      {
        file: 'vercel.json',
        data: JSON.stringify({
          version: 2,
          name: safeName,
          builds: [
            { src: '**/*.html', use: '@vercel/static' }
          ],
          routes: [
            { src: '/(.*)', dest: '/index.html' }
          ]
        }, null, 2)
      }
    ];

    // Параметры деплоя
    const deployPayload: Record<string, unknown> = {
      name: safeName,
      files: files,
      projectSettings: {
        framework: null
      },
      target: 'production'
    };

    // Добавляем projectId если есть
    if (VERCEL_PROJECT_ID) {
      deployPayload.projectId = VERCEL_PROJECT_ID;
    }

    // Деплоим в Vercel
    const deployUrl = VERCEL_TEAM_ID 
      ? `https://api.vercel.com/v13/deployments?teamId=${VERCEL_TEAM_ID}`
      : 'https://api.vercel.com/v13/deployments';

    const response = await fetch(deployUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deployPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Vercel API error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: `Vercel API error: ${response.status}`,
          details: errorData
        },
        { status: 500 }
      );
    }

    const deployData = await response.json();
    
    return NextResponse.json({
      success: true,
      url: `https://${deployData.url}`,
      deploymentId: deployData.id,
      inspectUrl: `https://vercel.com/deployments/${deployData.id}`
    });

  } catch (error) {
    console.error('Error deploying to Vercel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deploy to Vercel' },
      { status: 500 }
    );
  }
}

// Получить статус деплоя
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get('deploymentId');

  if (!deploymentId || !VERCEL_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'Deployment ID and Vercel token required' },
      { status: 400 }
    );
  }

  try {
    const url = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${VERCEL_TEAM_ID}`
      : `https://api.vercel.com/v13/deployments/${deploymentId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get deployment status' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      status: data.readyState,
      url: `https://${data.url}`,
      buildLogs: data.buildingAt
    });

  } catch (error) {
    console.error('Error getting deployment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get deployment status' },
      { status: 500 }
    );
  }
}
