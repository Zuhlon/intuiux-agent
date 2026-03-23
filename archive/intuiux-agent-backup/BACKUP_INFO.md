# IntuiUX Agent Backup

**Backup Date:** 2025-01-20
**Version:** 1.1.0

## Описание

Полная резервная копия IntuiUX Agent — AI-powered UX Pipeline для трансформации транскрипций в интерактивные прототипы.

## Структура 9-этапного UX Pipeline

1. **Idea** — Анализ и формирование идеи продукта
2. **Competitors** — Конкурентный анализ
3. **CJM** — Customer Journey Map
4. **IA** — Информационная архитектура
5. **Userflow** — Пользовательские потоки
6. **Prototype** — Интерактивные прототипы
7. **Invitation** — Приглашение пользователей
8. **Guideline** — UX руководства
9. **Metrics** — Метрики успеха

## Технологический стек

- **Framework:** Next.js 16 с App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM (SQLite)
- **AI SDK:** z-ai-web-dev-sdk

## Ключевые файлы

- `src/app/page.tsx` — Главный интерфейс агента
- `src/app/api/chat/route.ts` — API маршруты для чата
- `src/app/api/pipeline/` — API для каждого этапа pipeline
- `src/components/` — UI компоненты
- `prisma/schema.prisma` — Схема базы данных

## Восстановление

```bash
bun install
bun run db:push
bun run dev
```

## GitHub Repository

https://github.com/Zuhlon/intuiux-agent
