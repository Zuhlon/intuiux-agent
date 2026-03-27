/**
 * Upload backup archive to GitHub
 */

import * as fs from 'fs';

const GITHUB_TOKEN = 'process.env.GITHUB_TOKEN';
const GITHUB_REPO = 'Zuhlon/intuiux-agent';
const GITHUB_API = 'https://api.github.com';
const BRANCH = 'master';

const LOCAL_FILE = '/home/z/my-project/intuiux-agent-backup-20260318.tar.gz';
const GITHUB_PATH = 'archive/intuiux-agent-backup-20260318.tar.gz';

async function getFileSha(filePath: string): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
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

async function uploadFile(
  localPath: string, 
  githubPath: string, 
  message: string
): Promise<boolean> {
  // Read file as binary and convert to base64
  const content = fs.readFileSync(localPath);
  const base64Content = content.toString('base64');
  
  const sha = await getFileSha(githubPath);
  
  const body: Record<string, unknown> = {
    message,
    content: base64Content,
    branch: BRANCH,
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  try {
    console.log(`Uploading ${localPath} to ${githubPath}...`);
    console.log(`File size: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
    
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${githubPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (res.ok) {
      console.log(`✅ Uploaded successfully!`);
      return true;
    } else {
      const error = await res.json();
      console.error(`❌ Failed to upload:`, error.message);
      return false;
    }
  } catch (e) {
    console.error(`❌ Error:`, e);
    return false;
  }
}

async function main() {
  console.log('🚀 Uploading backup to GitHub...\n');
  console.log(`📂 Local file: ${LOCAL_FILE}`);
  console.log(`📁 GitHub path: ${GITHUB_REPO}/${GITHUB_PATH}\n`);
  
  const success = await uploadFile(
    LOCAL_FILE, 
    GITHUB_PATH, 
    'Add backup: intuiux-agent-backup-20260318'
  );
  
  if (success) {
    console.log(`\n✨ Backup available at:`);
    console.log(`   https://github.com/${GITHUB_REPO}/blob/${BRANCH}/${GITHUB_PATH}`);
  }
}

main().catch(console.error);
