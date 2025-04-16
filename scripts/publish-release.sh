#!/bin/bash

INFO_FILE="release-info.md"
OUTPUT_FILE="changelog-release.md"
RELEASES_FILE="../CHANGELOG.md"

if [ ! -f "$INFO_FILE" ]; then
  echo "❌ Файл $INFO_FILE не найден"
  exit 1
fi

VERSION=$(grep "^VERSION:" "$INFO_FILE" | cut -d':' -f2- | xargs)

if [ -z "$VERSION" ]; then
  echo "❌ Не указана версия в $INFO_FILE"
  exit 1
fi

if [ ! -f "$OUTPUT_FILE" ]; then
  echo "❌ Файл $OUTPUT_FILE не найден"
  exit 1
fi

echo "🚀 Публикация GitHub Release $VERSION..."
gh release create "$VERSION" -F "$OUTPUT_FILE" -t "Release $VERSION" --verify-tag

# Добавление в начало ../RELEASES.md
echo "📝 Обновление $RELEASES_FILE..."
echo -e "$(cat "$OUTPUT_FILE")\n\n---\n\n$(cat "$RELEASES_FILE" 2>/dev/null)" > "$RELEASES_FILE"

echo "🎉 Release $VERSION опубликован и добавлен в $RELEASES_FILE"
