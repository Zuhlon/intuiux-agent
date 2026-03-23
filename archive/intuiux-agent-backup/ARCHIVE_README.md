# IntuiUX Agent - Archive Backup

**Дата создания:** $(date +%Y-%m-%d)

## Описание проекта

IntuiUX Agent — AI-ассистент для UX-исследований с пайплайном обработки:

1. **Idea** — извлечение идеи из транскрипции (Product Owner с 10-летним стажем)
2. **Competitors** — анализ конкурентов и рынка
3. **CJM** — Customer Journey Map для разных персон
4. **IA** — Information Architecture
5. **Userflow** — пользовательские сценарии
6. **Prototype** — генерация прототипов

## Ключевые файлы

### Агенты и логика
- `src/lib/idea-extractor.ts` — PO-агент извлечения идей (v8.0)
- `src/lib/agent-context.ts` — система контекста агентов
- `src/lib/pipeline-config.ts` — конфигурация пайплайна
- `src/app/api/chat/route.ts` — основной API чата

### API endpoints
- `src/app/api/pipeline/stages/` — эндпоинты стадий пайплайна
- `src/app/api/agents/` — управление агентами
- `src/app/api/knowledge/` — база знаний

### UI компоненты
- `src/components/` — React компоненты
- `src/components/ui/` — shadcn/ui компоненты

### База данных
- `prisma/schema.prisma` — схема Prisma (SQLite)

## Технологии

- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- Prisma ORM
- z-ai-web-dev-sdk

## Запуск

```bash
bun install
bun run db:push
bun run dev
```

## Особенности

### Product Owner Agent (v8.0)

Агент обладает навыками PO с 10-летним стажем:

- **Определение отрасли** — 20+ индустрий с sub-industries
- **Извлечение функционала** — 12 типов паттернов из речи
- **Генерация гипотез** — Value, Solution, Growth, Market, Feasibility
- **MVP Scope** — автоматическое определение минимума
- **PO Insights** — стратегические рекомендации

---

*Создано автоматически системой резервного копирования*
