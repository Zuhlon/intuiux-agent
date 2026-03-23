import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const deployment = await db.prototypeDeployment.findUnique({
      where: { slug }
    });
    
    if (!deployment) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prototype Not Found</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                   display: flex; align-items: center; justify-content: center; min-height: 100vh; 
                   margin: 0; background: #0a0a0a; color: #fff; }
            .container { text-align: center; padding: 40px; }
            h1 { font-size: 48px; margin-bottom: 16px; color: #FACC15; }
            p { color: #a3a3a3; margin-bottom: 24px; }
            a { color: #FACC15; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <p>Prototype not found</p>
            <a href="/">← Back to IntuiUX</a>
          </div>
        </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // Increment view count
    await db.prototypeDeployment.update({
      where: { id: deployment.id },
      data: { viewCount: { increment: 1 } }
    });
    
    // Return the HTML content
    // Note: X-Prototype-Name header removed - can't use non-ASCII in HTTP headers
    return new NextResponse(deployment.htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'X-Accessibility-Score': String(deployment.accessibilityScore || 0)
      }
    });
    
  } catch (error) {
    console.error('Serve prototype error:', error);
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Error</title>
        <style>
          body { font-family: system-ui; display: flex; align-items: center; justify-content: center; 
                 min-height: 100vh; margin: 0; background: #0a0a0a; color: #fff; }
          .error { text-align: center; }
          h1 { color: #EF4444; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>Server Error</h1>
          <p>Failed to load prototype</p>
        </div>
      </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
