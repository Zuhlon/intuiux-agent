#!/bin/bash
# Скрипт для загрузки архива на GitHub

echo "==================================="
echo "IntuiUX Agent Backup - GitHub Upload"
echo "==================================="
echo ""

# Проверяем наличие токена
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Ошибка: Не установлен GITHUB_TOKEN"
    echo ""
    echo "Для загрузки на GitHub выполните:"
    echo "1. Создайте Personal Access Token на https://github.com/settings/tokens"
    echo "2. export GITHUB_TOKEN='your_token_here'"
    echo "3. Запустите этот скрипт снова"
    echo ""
    echo "Альтернативно, загрузите архив вручную:"
    echo "1. Откройте https://github.com/Zuhlon/intuiux-agent"
    echo "2. Нажмите 'Add file' > 'Upload files'"
    echo "3. Загрузите файл: archive/intuiux-agent-backup-v2-*.tar.gz"
    exit 1
fi

REPO="Zuhlon/intuiux-agent"
ARCHIVE_DIR="archive"
BACKUP_FILE=$(ls -t /home/z/my-project/archive/intuiux-agent-backup-v2-*.tar.gz | head -1)

echo "Файл архива: $BACKUP_FILE"
echo "Репозиторий: $REPO"
echo "Папка назначения: $ARCHIVE_DIR"
echo ""

# Загружаем через GitHub API
gh api repos/$REPO/contents/$ARCHIVE_DIR/$(basename $BACKUP_FILE) \
    --method PUT \
    -f message="Backup: IntuiUX Agent v2 ($(date +"%Y-%m-%d"))" \
    -f content="$(base64 -w 0 $BACKUP_FILE)" \
    -f branch="master"

echo ""
echo "Готово! Архив загружен в репозиторий."
