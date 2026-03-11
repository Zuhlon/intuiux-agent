# IntuiUX Agent Backup

## Резервная копия создана: 2025-01-20

### Файлы:

- `intuiux-agent-backup-20260311.tar.gz` (1.3 MB) — Полная резервная копия IntuiUX Agent v1.1.0

### Содержимое бэкапа:

- **9-этапный UX Pipeline**: Idea, Competitors, CJM, IA, Userflow, Prototype, Invitation, Guideline, Metrics
- **API маршруты**: chat, pipeline stages, agents, deploy, knowledge
- **UI компоненты**: shadcn/ui, MessageContent, MermaidRenderer
- **Скрипты**: init-agents, create-pipeline-agents, restructure-agents
- **Конфигурации**: Next.js 16, TypeScript, Tailwind CSS 4, Prisma

### Инструкция по восстановлению:

```bash
# Распаковать архив
tar -xzvf intuiux-agent-backup-20260311.tar.gz

# Перейти в папку
cd intuiux-agent-backup

# Установить зависимости
bun install

# Инициализировать базу данных
bun run db:push

# Запустить сервер
bun run dev
```

### Отправка на GitHub:

Для отправки на GitHub необходимо авторизоваться. Выполните:

```bash
# Вариант 1: Через Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/Zuhlon/intuiux-agent.git
git push -u origin master

# Вариант 2: Через SSH (если настроен ключ)
git remote set-url origin git@github.com:Zuhlon/intuiux-agent.git
git push -u origin master
```

### Репозиторий:

https://github.com/Zuhlon/intuiux-agent
