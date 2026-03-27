/**
 * Upload transcribes folder to GitHub
 */

import * as fs from 'fs';
import * as path from 'path';

const GITHUB_TOKEN = 'REDACTED';
const GITHUB_REPO = 'Zuhlon/intuiux-agent';
const GITHUB_API = 'https://api.github.com';
const BRANCH = 'master';

const TRANSCRIBES_DIR = '/home/z/my-project/upload/transcribes';
const GITHUB_FOLDER = 'upload';

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
  const content = fs.readFileSync(localPath, 'utf-8');
  const base64Content = Buffer.from(content).toString('base64');
  
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
      console.log(`✅ Uploaded: ${githubPath}`);
      return true;
    } else {
      const error = await res.json();
      console.error(`❌ Failed to upload ${githubPath}:`, error.message);
      return false;
    }
  } catch (e) {
    console.error(`❌ Error uploading ${githubPath}:`, e);
    return false;
  }
}

async function main() {
  console.log('🚀 Uploading transcribes to GitHub...\n');
  console.log(`📂 Local folder: ${TRANSCRIBES_DIR}`);
  console.log(`📁 GitHub folder: ${GITHUB_REPO}/${GITHUB_FOLDER}\n`);
  
  // Read all files from transcribes directory
  const files = fs.readdirSync(TRANSCRIBES_DIR).filter(f => f.endsWith('.md'));
  
  console.log(`Found ${files.length} files to upload:\n`);
  
  let successCount = 0;
  
  for (const file of files) {
    const localPath = path.join(TRANSCRIBES_DIR, file);
    const githubPath = `${GITHUB_FOLDER}/${file}`;
    const message = `Add transcription: ${file}`;
    
    const success = await uploadFile(localPath, githubPath, message);
    if (success) successCount++;
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n📊 Summary: ${successCount}/${files.length} files uploaded successfully`);
  
  if (successCount === files.length) {
    console.log(`\n✨ All transcribes are now available at:`);
    console.log(`   https://github.com/${GITHUB_REPO}/tree/${BRANCH}/${GITHUB_FOLDER}`);
  }
}

main().catch(console.error);
