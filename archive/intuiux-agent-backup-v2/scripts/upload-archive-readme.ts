/**
 * Upload archive README to GitHub
 */

const GITHUB_TOKEN = 'REDACTED';
const GITHUB_REPO = 'Zuhlon/intuiux-agent';
const GITHUB_API = 'https://api.github.com';
const BRANCH = 'master';

const README_CONTENT = `# Archive

Эта папка содержит резервные копии и архивы проекта IntuiUX Agent.

---

## 📦 Резервные копии

| Файл | Дата | Размер | Описание |
|------|------|--------|----------|
| \`intuiux-agent-backup-20260318.tar.gz\` | 2026-03-18 | 5.5 MB | Полная резервная копия проекта |

---

## 📥 Как восстановить

\`\`\`bash
# Скачать архив
wget https://github.com/Zuhlon/intuiux-agent/raw/master/archive/intuiux-agent-backup-20260318.tar.gz

# Распаковать
tar -xzvf intuiux-agent-backup-20260318.tar.gz

# Установить зависимости
bun install

# Запустить
bun run dev
\`\`\`

---

## 📋 Содержимое архива

- Исходный код (\`src/\`)
- API маршруты (\`src/app/api/\`)
- Компоненты UI (\`src/components/\`)
- База данных Prisma (\`prisma/\`)
- Скрипты (\`scripts/\`)
- Конфигурационные файлы
- Транскрипции (\`upload/transcribes/\`)

---

Создано автоматически IntuiUX Agent.
`;

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

async function uploadReadme() {
  const githubPath = 'archive/README.md';
  const base64Content = Buffer.from(README_CONTENT).toString('base64');
  
  const sha = await getFileSha(githubPath);
  
  const body: Record<string, unknown> = {
    message: 'Add archive README',
    content: base64Content,
    branch: BRANCH,
  };
  
  if (sha) {
    body.sha = sha;
  }
  
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
    console.log('✅ README uploaded to archive/');
  } else {
    const error = await res.json();
    console.error('❌ Failed:', error.message);
  }
}

uploadReadme();
