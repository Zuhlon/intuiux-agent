import { NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = 'Zuhlon/intuiux-agent';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`${GITHUB_RAW_URL}/${GITHUB_REPO}/master/prototypes/${id}/index.html`);
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
