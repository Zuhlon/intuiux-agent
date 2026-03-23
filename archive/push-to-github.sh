#!/bin/bash
# Скрипт для загрузки архива IntuiUX Agent на GitHub
# 
# Использование:
#   1. Создайте новый репозиторий на GitHub (например, intuiux-archive)
#   2. Запустите этот скрипт с URL репозитория:
#      ./push-to-github.sh https://github.com/YOUR_USERNAME/intuiux-archive.git
#
# Или с GitHub token:
#      ./push-to-github.sh https://YOUR_TOKEN@github.com/YOUR_USERNAME/intuiux-archive.git

if [ -z "$1" ]; then
    echo "❌ Укажите URL репозитория GitHub"
    echo "Пример: $0 https://github.com/username/intuiux-archive.git"
    exit 1
fi

REPO_URL="$1"
ARCHIVE_DIR="/home/z/my-project/archive/intuiux-agent-backup"

echo "🚀 Загрузка архива IntuiUX Agent на GitHub..."
echo "📂 Папка: $ARCHIVE_DIR"
echo "🔗 Репозиторий: $REPO_URL"
echo ""

cd "$ARCHIVE_DIR" || exit 1

# Добавляем remote
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

# Пушим
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Архив успешно загружен на GitHub!"
    echo "📦 128 файлов, 36,519 строк кода"
else
    echo ""
    echo "❌ Ошибка при загрузке. Проверьте URL и права доступа."
fi
