import { NextRequest, NextResponse } from 'next/server';

// GitHub API configuration from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Zuhlon/intuiux-agent';
const GITHUB_API = 'https://api.github.com';

async function deleteFile(path: string, message: string, sha: string): Promise<boolean> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sha,
        branch: 'master',
      }),
    });
    
    console.log(`[GitHub Delete] ${path} - status: ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error('GitHub delete error:', e);
    return false;
  }
}

async function createFile(path: string, content: string, message: string): Promise<{ success: boolean; sha?: string; error?: string }> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: 'master',
  };
  
  console.log(`[GitHub Create] Creating ${path}, content length: ${content.length}`);
  
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
    
    const responseText = await res.text();
    console.log(`[GitHub Create] Response status: ${res.status}`);
    
    if (res.ok) {
      const data = JSON.parse(responseText);
      return { success: true, sha: data.content?.sha };
    }
    return { success: false, error: responseText };
  } catch (e) {
    console.error('GitHub create error:', e);
    return { success: false, error: String(e) };
  }
}

async function uploadFile(path: string, content: string, message: string, sha?: string): Promise<{ success: boolean; sha?: string; error?: string }> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: 'master',
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  console.log(`[GitHub Upload] Uploading ${path}, SHA: ${sha}, content length: ${content.length}`);
  console.log(`[GitHub Upload] Content preview: ${content.substring(0, 200)}`);
  console.log(`[GitHub Upload] Base64 preview: ${Buffer.from(content).toString('base64').substring(0, 100)}`);
  
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
    
    const responseText = await res.text();
    console.log(`[GitHub Upload] Response status: ${res.status}`);
    console.log(`[GitHub Upload] Response: ${responseText.substring(0, 500)}`);
    
    if (res.ok) {
      const data = JSON.parse(responseText);
      return { success: true, sha: data.content?.sha };
    }
    return { success: false, error: responseText };
  } catch (e) {
    console.error('GitHub upload error:', e);
    return { success: false, error: String(e) };
  }
}

async function getFileSha(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${path}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Page content - fixed version with renamed variable to avoid encoding issues
    const pageContent = `'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrototypePage() {
  const params = useParams();
  const id = params.id as string;
  const prototypeHtml = useState<string>('');
  const html = prototypeHtml[0];
  const setHtml = prototypeHtml[1];
  const loadingState = useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];
  const errorState = useState<string | null>(null);
  const error = errorState[0];
  const setError = errorState[1];

  useEffect(() => {
    const fetchPrototype = async () => {
      try {
        const response = await fetch('/api/prototype?id=' + id);
        if (!response.ok) throw new Error('Not found');
        const htmlContent = await response.text();
        setHtml(htmlContent);
      } catch (err) {
        setError('Прототип не найден');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPrototype();
  }, [id]);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#ffffff',color:'#1e293b',fontFamily:'Inter,system-ui'}}>Загрузка...</div>;
  if (error) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#ffffff',color:'#ef4444',fontFamily:'Inter,system-ui'}}>Ошибка: {error}</div>;
  return <iframe srcDoc={html} style={{width:'100%',height:'100vh',border:'none'}} title="Prototype" />;
}
`;

    // API content
    const apiContent = `import { NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = 'Zuhlon/intuiux-agent';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  
  try {
    const response = await fetch(\`\${GITHUB_RAW_URL}/\${GITHUB_REPO}/master/prototypes/\${safeId}/index.html\`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const html = await response.text();
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
`;

    const files = [
      { path: 'src/app/prototypes/[id]/page.tsx', content: pageContent },
      { path: 'src/app/api/prototype/route.ts', content: apiContent },
    ];
    
    const results = [];
    
    for (const file of files) {
      // Get SHA first
      const sha = await getFileSha(file.path);
      console.log(`[Update] Got SHA for ${file.path}: ${sha}`);
      
      // Delete the old file
      if (sha) {
        const deleted = await deleteFile(file.path, `Remove old: ${file.path}`, sha);
        console.log(`[Update] Deleted ${file.path}: ${deleted}`);
        // Wait a moment for GitHub to process
        await new Promise(r => setTimeout(r, 500));
      }
      
      // Create fresh file
      const result = await createFile(file.path, file.content, `Fix prototype viewer: ${file.path}`);
      results.push({ path: file.path, success: result.success, error: result.error });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Files updated on GitHub',
      results,
      note: 'Vercel will auto-deploy. Wait 1-2 minutes before testing.'
    });
    
  } catch (error) {
    console.error('Error updating prototype files:', error);
    return NextResponse.json({ error: 'Failed to update files' }, { status: 500 });
  }
}
