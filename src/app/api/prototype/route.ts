import { NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = 'Zuhlon/intuiux-agent';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  console.log('[Prototype API] Request received for id:', id);
  
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  
  // Sanitize ID to prevent path traversal
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  console.log('[Prototype API] Sanitized id:', safeId);
  
  const url = `${GITHUB_RAW_URL}/${GITHUB_REPO}/master/prototypes/${safeId}/index.html`;
  console.log('[Prototype API] Fetching from:', url);
  
  try {
    const response = await fetch(url);
    console.log('[Prototype API] GitHub response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('[Prototype API] GitHub error response:', errorText.substring(0, 200));
      return NextResponse.json({ error: 'Not found', id: safeId, status: response.status }, { status: 404 });
    }
    
    const html = await response.text();
    console.log('[Prototype API] HTML length:', html.length);
    console.log('[Prototype API] HTML preview:', html.substring(0, 300));
    
    return new NextResponse(html, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('[Prototype API] Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch', details: String(error) }, { status: 500 });
  }
}
