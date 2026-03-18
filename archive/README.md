# Archive

Эта папка содержит резервные копии и архивы проекта IntuiUX Agent.

---

## 📦 Резервные копии

| Файл | Дата | Размер | Описание |
|------|------|--------|----------|
| `intuiux-agent-backup-20260318.tar.gz` | 2026-03-18 | 5.5 MB | Полная резервная копия проекта |

---

## 📥 Как восстановить

```bash
# Скачать архив
wget https://github.com/Zuhlon/intuiux-agent/raw/master/archive/intuiux-agent-backup-20260318.tar.gz

# Распаковать
tar -xzvf intuiux-agent-backup-20260318.tar.gz

# Установить зависимости
bun install

# Запустить
bun run dev
```

---

## 📋 Содержимое архива

- Исходный код (`src/`)
- API маршруты (`src/app/api/`)
- Компоненты UI (`src/components/`)
- База данных Prisma (`prisma/`)
- Скрипты (`scripts/`)
- Конфигурационные файлы
- Транскрипции (`upload/transcribes/`)

---

Создано автоматически IntuiUX Agent.
