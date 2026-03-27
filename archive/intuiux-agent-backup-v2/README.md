# IntuiUX Agent

**AI-Powered UX Pipeline** — Преобразует идеи в готовые прототипы и публикует их на GitHub.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Возможности

### 9-этапный UX Pipeline

1. **💡 Идея** — Извлечение идеи из текста или транскрипции
2. **🔍 Конкурентный анализ** — 3 прямых + 3 косвенных конкурента
3. **🗺️ CJM** — Customer Journey Map с эмоциональным графиком
4. **🏗️ IA** — Информационная архитектура с таксономиями
5. **👥 Userflow** — Детальные пользовательские сценарии
6. **📦 Прототип → GitHub** — Интерактивный HTML прототип публикуется автоматически
7. **📧 Приглашение** — Скрипт для рекрутинга участников тестирования
8. **📋 Гайдлайн** — Руководство по юзабилити-тестированию
9. **📊 Метрики** — Продуктовые метрики и рекомендации

### Ключевые функции

- **Автоматическая публикация на GitHub** — созданные прототипы выкладываются в репозиторий
- **Полноценный конкурентный анализ** — поиск и анализ прямых и косвенных конкурентов
- **Яндекс.Метрика** — встроенная интеграция аналитики в прототипы
- **Accessibility** — WCAG AA совместимые прототипы
- **Техно-стиль** — тёмная тема с медово-жёлтыми акцентами

## 🛠️ Технологии

- **Framework**: Next.js 16 с App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM + SQLite
- **AI**: Z.ai LLM SDK
- **Diagrams**: Mermaid.js

## 📦 Установка

```bash
# Клонирование репозитория
git clone https://github.com/Zuhlon/intuiux-agent.git
cd intuiux-agent

# Установка зависимостей
bun install

# Настройка базы данных
bun run db:push

# Запуск
bun run dev
```

## 🔧 Переменные окружения

Создайте файл `.env`:

```env
DATABASE_URL="file:./dev.db"
```

## 📖 Использование

1. Откройте приложение в браузере
2. Загрузите файл с описанием или вставьте текст
3. Нажмите **"Создать прототип и выложить на GitHub"**
4. Дождитесь завершения 9 этапов
5. Получите ссылку на прототип в GitHub

## 🎨 Что создаётся

### Прототипы
- Полноценный HTML/CSS интерфейс
- Tailwind CSS через CDN
- Интеграция Яндекс.Метрики
- Адаптивный дизайн (mobile-first)

### Артефакты
- Идея продукта с описанием
- Конкурентный анализ
- Customer Journey Map (Mermaid)
- Информационная архитектура (ER-диаграммы)
- Userflow диаграммы
- Скрипты приглашений
- Гайдлайн тестирования
- Продуктовые метрики

## 📊 Публикация прототипов

Созданные прототипы автоматически публикуются в папку `prototypes/` репозитория:
- `prototypes/{название-продукта}-{timestamp}/index.html`
- `prototypes/{название-продукта}-{timestamp}/README.md`

## 🤝 Contributing

Приветствуются любые улучшения! Создавайте Pull Requests.

## 📄 Лицензия

MIT License — см. файл [LICENSE](LICENSE)

---

Создано с ❤️ командой IntuiUX
