# IntuiUX Agent Backup

**Дата резервной копии:** 2025-03-05

## Описание

IntuiUX Agent — AI-powered UX Pipeline Generator. Автоматически генерирует UX-артефакты из идеи продукта.

## 9-этапный пайплайн

1. **💡 Идея** — Извлечение идеи из текста/транскрипции
2. **🔍 Конкуренты** — 3 прямых + 3 косвенных конкурента с детальным анализом
3. **🗺️ CJM** — Customer Journey Map
4. **🏗️ IA** — Информационная архитектура
5. **👥 Userflow** — Детальные сценарии использования
6. **📦 Прототип** — HTML прототип → GitHub
7. **📧 Приглашение** — Скрипт приглашения на тестирование
8. **📋 Гайдлайн** — Руководство по юзабилити-тестированию
9. **📊 Метрики** — Продуктовые метрики и рекомендации

## Структура

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # Главный UI компонент
│   │   ├── layout.tsx        # Layout
│   │   ├── globals.css       # Стили
│   │   └── api/
│   │       ├── pipeline/
│   │       │   └── route.ts  # API управления сессиями
│   │       └── pipeline/stages/
│   │           ├── idea/route.ts
│   │           ├── competitors/route.ts
│   │           ├── cjm/route.ts
│   │           ├── ia/route.ts
│   │           ├── userflow/route.ts
│   │           ├── prototype/route.ts
│   │           ├── invitation/route.ts
│   │           ├── guidelines/route.ts
│   │           └── metrics/route.ts
│   ├── components/ui/        # shadcn/ui компоненты
│   ├── hooks/                # React хуки
│   └── lib/
│       ├── db.ts             # Prisma клиент
│       ├── utils.ts          # Утилиты
│       └── zai.ts            # Z.ai LLM SDK
├── prisma/
│   └── schema.prisma         # Схема базы данных
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── components.json           # shadcn/ui конфигурация
```

## Технологии

- **Next.js 16** с App Router
- **TypeScript**
- **Prisma** + SQLite
- **Tailwind CSS** + shadcn/ui
- **Z.ai LLM SDK** для генерации

## Запуск

```bash
# Установка зависимостей
bun install

# Настройка базы данных
bun run db:push

# Запуск сервера
bun run dev
```

## Требования

- Node.js 18+
- Bun runtime
- Z.ai API конфигурация (.z-ai-config файл)

---
*Создано автоматически IntuiUX Agent*
