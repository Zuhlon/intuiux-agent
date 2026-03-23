# IntuiUX Agent

**AI-Powered UX Pipeline** — Преобразует идеи в готовые прототипы за минуты.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Возможности

### 9-этапный UX Pipeline

| Этап | Описание | Результат |
|------|----------|-----------|
| 💡 **Идея** | Извлечение идеи из текста | Структурированное описание продукта |
| 🔍 **Конкуренты** | Анализ рынка | 3 прямых + 3 косвенных конкурента |
| 🗺️ **CJM** | Customer Journey Map | Диаграмма эмоционального пути |
| 🏗️ **IA** | Информационная архитектура | Mermaid mindmap + ER-диаграмма |
| 👥 **Userflow** | Пользовательские сценарии | Flowchart диаграммы |
| 📦 **Прототип** | Интерактивный HTML | Автопубликация на GitHub |
| 📧 **Приглашение** | Рекрутинг участников | Скрипт приглашения |
| 📋 **Гайдлайн** | Руководство тестирования | Чек-лист и сценарии |
| 📊 **Метрики** | Продуктовые KPI | Рекомендации по аналитике |

### Ключевые функции

- ✅ **Полноценная LLM интеграция** — все этапы работают через AI
- ✅ **Автопубликация на GitHub** — прототипы выкладываются автоматически
- ✅ **Web Search для конкурентов** — поиск реальных конкурентов
- ✅ **Цветовая кодировка CJM** — наглядная визуализация ролей
- ✅ **Mermaid диаграммы** — IA, Userflow, CJM визуализации
- ✅ **Accessibility WCAG AA** — доступные прототипы

## 🛠️ Технологии

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM + SQLite
- **AI**: Z.ai LLM SDK
- **Diagrams**: Mermaid.js
- **Icons**: Lucide React

## 📦 Установка

```bash
# Клонирование
git clone https://github.com/Zuhlon/intuiux-agent.git
cd intuiux-agent

# Установка зависимостей
bun install

# Настройка базы данных
bun run db:push

# Запуск
bun run dev
```

## 🔧 Настройка LLM

### Шаг 1: Создайте конфигурационный файл

Создайте файл `.z-ai-config` в домашней директории:

```json
{
  "baseUrl": "https://your-llm-api.com/v1",
  "apiKey": "your-api-key-here"
}
```

### Шаг 2: Переменные окружения

Создайте файл `.env`:

```env
DATABASE_URL="file:./dev.db"

# Для публикации прототипов (опционально)
GITHUB_TOKEN="ghp_your_token"
GITHUB_REPO="your-username/prototypes-repo"

# Для веб-поиска конкурентов (опционально)
SEARCH_API_KEY="your-search-api-key"
```

## 📖 Использование

1. Откройте http://localhost:3000
2. Вставьте описание идеи продукта
3. Нажмите **"Создать прототип"**
4. Следите за прогрессом 9 этапов
5. Получите ссылку на готовый прототип

## 🎨 Цветовая кодировка CJM

Customer Journey Map использует цветовые бейджи для наглядности:

| Цвет | Роль | Описание |
|------|------|----------|
| 🔵 Синий | Персона | Действия и мысли пользователя |
| 🟣 Фиолетовый | Touchpoint | Точки контакта |
| 🔴 Красный | Боль | Проблемные места |
| 🟢 Зелёный | Возможность | Рекомендации |
| 🟡 Янтарный | Эмоция | Эмоциональные аспекты |

## 📁 Структура проекта

```
src/
├── app/
│   ├── api/
│   │   ├── chat/           # LLM интеграция
│   │   ├── pipeline/       # Этапы пайплайна
│   │   └── deploy/         # GitHub деплой
│   └── page.tsx            # Главная страница
├── components/
│   ├── MessageContent.tsx  # Рендеринг контента
│   └── ui/                 # shadcn компоненты
└── lib/
    ├── zai.ts              # LLM SDK
    └── idea-extractor.ts   # Извлечение идей
```

## 🤝 Contributing

Приветствуются Pull Requests!

## 📄 Лицензия

MIT License

---

Создано с ❤️ командой IntuiUX
