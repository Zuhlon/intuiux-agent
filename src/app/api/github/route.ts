import { NextRequest, NextResponse } from 'next/server';

// GitHub API configuration from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Zuhlon/intuiux-agent';
const GITHUB_API = 'https://api.github.com';

// Upload file to GitHub
async function uploadFile(path: string, content: string, message: string, sha?: string): Promise<boolean> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: 'master',
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return res.ok;
  } catch (e) {
    console.error('GitHub upload error:', e);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { htmlContent, productName, readme } = body;
    
    if (!htmlContent) {
      return NextResponse.json(
        { success: false, error: 'HTML content is required' },
        { status: 400 }
      );
    }
    
    // Generate unique folder name
    const timestamp = Date.now();
    const safeName = (productName || 'prototype')
      .toLowerCase()
      .replace(/[^a-z0-9а-яё\s-]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 30) || 'prototype';
    const folderName = `${safeName}-${timestamp}`;
    const folderPath = `prototypes/${folderName}`;
    
    // Create HTML file
    const htmlSuccess = await uploadFile(
      `${folderPath}/index.html`,
      htmlContent,
      `Add prototype: ${productName || 'Untitled'}`
    );
    
    if (!htmlSuccess) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload HTML file to GitHub' },
        { status: 500 }
      );
    }
    
    // Create README
    const readmeContent = readme || `# ${productName || 'Prototype'}

Автоматически сгенерированный прототип от IntuiUX Agent.

## Просмотр
Откройте файл \`index.html\` в браузере.

## Технологии
- HTML5
- Tailwind CSS (CDN)
- Яндекс.Метрика (интеграция)

---
Создано с помощью [IntuiUX Agent](https://github.com/Zuhlon/intuiux-agent)
`;
    
    await uploadFile(
      `${folderPath}/README.md`,
      readmeContent,
      `Add README for ${productName || 'prototype'}`
    );
    
    // Generate URLs
    const githubRepoUrl = `https://github.com/${GITHUB_REPO}/tree/master/${folderPath}`;
    
    return NextResponse.json({
      success: true,
      url: githubRepoUrl,
      folderName,
    });
    
  } catch (error) {
    console.error('Error publishing to GitHub:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish to GitHub' },
      { status: 500 }
    );
  }
}
