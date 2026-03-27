/**
 * Vercel API Integration for prototype deployments
 * 
 * Requirements:
 * - VERCEL_TOKEN in .env (get from https://vercel.com/account/tokens)
 * - VERCEL_TEAM_ID optional (for team deployments)
 */

interface VercelDeploymentResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  error?: string;
}

interface VercelFile {
  file: string;
  data: string;
}

/**
 * Deploy HTML prototype to Vercel
 */
export async function deployToVercel(
  productName: string,
  htmlContent: string,
  slug: string
): Promise<VercelDeploymentResult> {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  // Check if Vercel is configured
  if (!token) {
    console.log('[Vercel] No VERCEL_TOKEN configured, using local deployment');
    return {
      success: false,
      error: 'VERCEL_TOKEN not configured'
    };
  }

  try {
    // Create project files
    const files: VercelFile[] = [
      {
        file: 'index.html',
        data: htmlContent
      },
      {
        file: 'vercel.json',
        data: JSON.stringify({
          version: 2,
          routes: [
            { handle: 'filesystem' },
            { src: '/(.*)', dest: '/index.html' }
          ]
        })
      },
      {
        file: 'package.json',
        data: JSON.stringify({
          name: slug,
          version: '1.0.0',
          private: true
        })
      }
    ];

    // Build API URL
    const apiUrl = teamId 
      ? `https://api.vercel.com/v13/deployments?teamId=${teamId}`
      : 'https://api.vercel.com/v13/deployments';

    console.log(`[Vercel] Deploying "${productName}" (${slug})...`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: slug,
        files,
        projectSettings: {
          framework: null
        },
        target: 'production'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Vercel] API error ${response.status}:`, errorText);
      
      return {
        success: false,
        error: `Vercel API error: ${response.status}`
      };
    }

    const data = await response.json();
    
    console.log(`[Vercel] Deployment created:`, data.url);

    return {
      success: true,
      url: `https://${data.url}`,
      deploymentId: data.id
    };

  } catch (error) {
    console.error('[Vercel] Deployment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check Vercel deployment status
 */
export async function getVercelDeploymentStatus(
  deploymentId: string
): Promise<{ status: string; url?: string }> {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token) {
    return { status: 'unknown' };
  }

  try {
    const apiUrl = teamId
      ? `https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${teamId}`
      : `https://api.vercel.com/v13/deployments/${deploymentId}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return { status: 'error' };
    }

    const data = await response.json();
    
    return {
      status: data.readyState || 'building',
      url: `https://${data.url}`
    };

  } catch (error) {
    console.error('[Vercel] Status check error:', error);
    return { status: 'error' };
  }
}

/**
 * Check if Vercel is configured
 */
export function isVercelConfigured(): boolean {
  return !!process.env.VERCEL_TOKEN;
}
