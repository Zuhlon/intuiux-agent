# IntuiUX Agent - Backup Archive v2

**Дата архивации:** $(date +"%Y-%m-%d %H:%M")

## Описание

Это резервная копия проекта IntuiUX Agent - AI-powered UX Pipeline, который преобразует идеи в готовые прототипы.

## Содержимое архива

### Ключевые агенты
- `src/lib/idea-extractor.ts` - Извлечение идей из текста (v11.0 - NO TEMPLATES)
- `src/lib/competitor-analyzer.ts` - Анализ конкурентов (v2.0 - NO TEMPLATES)

### API Routes
- `src/app/api/pipeline/` - Pipeline endpoints для всех 9 этапов
- `src/app/api/competitors-search/` - Поиск конкурентов через веб-поиск
- `src/app/api/chat/` - Chat API для взаимодействия с агентом

### Pipeline этапы
1. 💡 Idea - Извлечение идеи
2. 🔍 Competitors - Конкурентный анализ
3. 🗺️ CJM - Customer Journey Map
4. 🏗️ IA - Информационная архитектура
5. 👥 Userflow - Пользовательские сценарии
6. 📦 Prototype - HTML прототип
7. 📧 Invitation - Скрипт рекрутинга
8. 📋 Guidelines - Гайдлайн тестирования
9. 📊 Metrics - Продуктовые метрики

## Важные особенности

### v11.0 - NO TEMPLATES
**КРИТИЧЕСКИ ВАЖНО:** Агент должен извлекать категорию продукта ИЗ ТЕКСТА, не использовать шаблоны или предопределённые категории.

Это требование было нарушено в предыдущих версиях, когда агент использовал предопределённые отраслевые базы данных.

### Принципы
1. Извлекать ТОЛЬКО то, что ЕСТЬ в тексте
2. НЕ придумывать и НЕ добавлять ничего от себя
3. НЕ использовать шаблоны или предопределённые категории
4. Если в тексте нет информации — оставить поле пустым

## Технологии

- Next.js 16 с App Router
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- Prisma ORM + SQLite
- Z.ai LLM SDK
- Mermaid.js

## Восстановление

Для восстановления из архива:

```bash
# Копировать файлы в новый проект
cp -r archive/intuiux-agent-backup-v2/* /path/to/new/project/

# Установить зависимости
bun install

# Настроить базу данных
bun run db:push

# Запустить
bun run dev
```

---

*Архив создан автоматически*
