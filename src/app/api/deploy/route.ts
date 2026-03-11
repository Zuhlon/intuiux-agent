import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deployToVercel, isVercelConfigured } from '@/lib/vercel-deploy';
import { deployToGitHubPages, isGitHubConfigured } from '@/lib/github-pages';

// Transliterate Russian to English for URL slug
function transliterateToSlug(text: string): string {
  const ruToEn: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo',
    'Ж': 'zh', 'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm',
    'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
    'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sch',
    'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya',
    ' ': '-', '_': '-', '/': '-', '\\': '-', ' ': '-'
  };
  
  // Transliterate first, then clean up
  let slug = text
    .split('')
    .map(char => ruToEn[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '') // Keep only latin letters, numbers, and dashes
    .replace(/-+/g, '-') // Replace multiple dashes
    .replace(/^-|-$/g, '') // Trim dashes
    .substring(0, 50); // Limit length
  
  // Add random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
}

// Simple accessibility check
function checkAccessibility(html: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  
  // Check for alt attributes on images
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const imgWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
  if (imgWithoutAlt.length > 0) {
    issues.push(`Images without alt attribute: ${imgWithoutAlt.length}`);
    score -= 10 * imgWithoutAlt.length;
  }
  
  // Check for semantic HTML
  if (!html.includes('<main') && !html.includes('<main>')) {
    issues.push('Missing <main> element');
    score -= 5;
  }
  
  if (!html.includes('<header') && !html.includes('<header>')) {
    issues.push('Missing <header> element');
    score -= 5;
  }
  
  if (!html.includes('<nav') && !html.includes('<nav>')) {
    issues.push('Missing <nav> element');
    score -= 5;
  }
  
  // Check for ARIA labels on buttons without text
  const buttonMatches = html.match(/<button[^>]*>\s*<\/button>/gi) || [];
  if (buttonMatches.length > 0) {
    issues.push(`Buttons without text content: ${buttonMatches.length}`);
    score -= 5 * buttonMatches.length;
  }
  
  // Check for form labels
  const inputMatches = html.match(/<input[^>]*type="text"[^>]*>/gi) || [];
  const inputWithoutLabel = inputMatches.filter(input => {
    const idMatch = input.match(/id="([^"]+)"/);
    if (!idMatch) return true;
    return !html.includes(`for="${idMatch[1]}"`);
  });
  if (inputWithoutLabel.length > 0) {
    issues.push(`Inputs without associated labels: ${inputWithoutLabel.length}`);
    score -= 5 * inputWithoutLabel.length;
  }
  
  // Check for lang attribute
  if (!html.includes('lang=')) {
    issues.push('Missing lang attribute on <html>');
    score -= 5;
  }
  
  // Check for title
  if (!html.includes('<title>') || !html.includes('</title>')) {
    issues.push('Missing <title> element');
    score -= 10;
  }
  
  // Check for meta viewport
  if (!html.includes('viewport')) {
    issues.push('Missing viewport meta tag');
    score -= 5;
  }
  
  // Check for color contrast (basic - check if using CSS variables or inline styles)
  if (!html.includes('color:') && !html.includes('--text') && !html.includes('color-')) {
    issues.push('Consider checking color contrast ratios');
    score -= 2;
  }
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  return { score, issues };
}

// Extract HTML from markdown code block
function extractHtml(content: string): string {
  // Try to extract from ```html code block
  const htmlMatch = content.match(/```html\s*([\s\S]*?)```/);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1].trim();
  }
  
  // Try to extract from ``` code block
  const codeMatch = content.match(/```\s*([\s\S]*?)```/);
  if (codeMatch && codeMatch[1] && (codeMatch[1].includes('<!DOCTYPE') || codeMatch[1].includes('<html'))) {
    return codeMatch[1].trim();
  }
  
  // If content looks like HTML, return as is
  if (content.includes('<!DOCTYPE') || content.includes('<html')) {
    return content.trim();
  }
  
  return content;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, htmlContent, sessionId, autoDeploy = true } = body;
    
    if (!htmlContent) {
      return NextResponse.json({ success: false, error: 'HTML content is required' }, { status: 400 });
    }
    
    // Extract HTML if wrapped in markdown
    const cleanHtml = extractHtml(htmlContent);
    
    // Generate English slug from product name
    const name = productName || 'prototype';
    const slug = transliterateToSlug(name);
    
    // Check accessibility
    const accessibility = checkAccessibility(cleanHtml);
    
    console.log(`[Deploy] Creating deployment for "${name}" with slug "${slug}"`);
    console.log(`[Deploy] Accessibility score: ${accessibility.score}`);
    console.log(`[Deploy] Vercel configured: ${isVercelConfigured()}`);
    
    // Create deployment record
    const deployment = await db.prototypeDeployment.create({
      data: {
        sessionId: sessionId || null,
        productName: name,
        slug,
        htmlContent: cleanHtml,
        accessibilityScore: accessibility.score,
        accessibilityIssues: JSON.stringify(accessibility.issues),
        status: 'draft'
      }
    });
    
    let finalUrl = `/api/prototype/${slug}`;
    let vercelDeploymentId: string | undefined;
    let deploymentMethod = 'local';
    
    // Try Vercel first if configured
    if (isVercelConfigured()) {
      console.log('[Deploy] Deploying to Vercel...');
      const vercelResult = await deployToVercel(name, cleanHtml, slug);
      
      if (vercelResult.success && vercelResult.url) {
        finalUrl = vercelResult.url;
        vercelDeploymentId = vercelResult.deploymentId;
        deploymentMethod = 'vercel';
        console.log(`[Deploy] Deployed to Vercel: ${finalUrl}`);
      } else {
        console.log(`[Deploy] Vercel deployment failed: ${vercelResult.error}`);
        
        // Try GitHub Pages as fallback
        if (isGitHubConfigured()) {
          console.log('[Deploy] Trying GitHub Pages...');
          const githubResult = await deployToGitHubPages(name, cleanHtml, slug);
          
          if (githubResult.success && githubResult.url) {
            finalUrl = githubResult.url;
            deploymentMethod = 'github';
            console.log(`[Deploy] Deployed to GitHub Pages: ${finalUrl}`);
          } else {
            console.log(`[Deploy] GitHub Pages failed: ${githubResult.error}`);
          }
        }
      }
    } else if (isGitHubConfigured()) {
      // Use GitHub Pages if Vercel not configured
      console.log('[Deploy] Deploying to GitHub Pages...');
      const githubResult = await deployToGitHubPages(name, cleanHtml, slug);
      
      if (githubResult.success && githubResult.url) {
        finalUrl = githubResult.url;
        deploymentMethod = 'github';
        console.log(`[Deploy] Deployed to GitHub Pages: ${finalUrl}`);
      } else {
        console.log(`[Deploy] GitHub Pages failed: ${githubResult.error}`);
      }
    } else {
      console.log('[Deploy] No external deployment configured, using local URL');
    }
    
    // Update with final URL
    const updatedDeployment = await db.prototypeDeployment.update({
      where: { id: deployment.id },
      data: {
        status: 'deployed',
        vercelUrl: finalUrl,
        vercelId: vercelDeploymentId,
        deployedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      deployment: {
        id: updatedDeployment.id,
        productName: updatedDeployment.productName,
        slug: updatedDeployment.slug,
        url: finalUrl,
        fullUrl: finalUrl.startsWith('http') ? finalUrl : `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''}${finalUrl}`,
        accessibilityScore: accessibility.score,
        accessibilityIssues: accessibility.issues,
        status: updatedDeployment.status,
        vercelConfigured: isVercelConfigured(),
        createdAt: updatedDeployment.createdAt
      }
    });
    
  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to deploy prototype' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const slug = searchParams.get('slug');
    
    if (slug) {
      const deployment = await db.prototypeDeployment.findUnique({
        where: { slug }
      });
      
      if (!deployment) {
        return NextResponse.json({ success: false, error: 'Deployment not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        deployment: {
          id: deployment.id,
          productName: deployment.productName,
          slug: deployment.slug,
          url: deployment.vercelUrl,
          accessibilityScore: deployment.accessibilityScore,
          accessibilityIssues: deployment.accessibilityIssues ? JSON.parse(deployment.accessibilityIssues) : [],
          status: deployment.status,
          viewCount: deployment.viewCount,
          createdAt: deployment.createdAt,
          deployedAt: deployment.deployedAt
        }
      });
    }
    
    if (sessionId) {
      const deployments = await db.prototypeDeployment.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' }
      });
      
      return NextResponse.json({
        success: true,
        deployments: deployments.map(d => ({
          id: d.id,
          productName: d.productName,
          slug: d.slug,
          url: d.vercelUrl,
          accessibilityScore: d.accessibilityScore,
          status: d.status,
          createdAt: d.createdAt
        }))
      });
    }
    
    // List all deployments
    const deployments = await db.prototypeDeployment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return NextResponse.json({
      success: true,
      deployments: deployments.map(d => ({
        id: d.id,
        productName: d.productName,
        slug: d.slug,
        url: d.vercelUrl,
        accessibilityScore: d.accessibilityScore,
        status: d.status,
        viewCount: d.viewCount,
        createdAt: d.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get deployments error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get deployments' 
    }, { status: 500 });
  }
}
