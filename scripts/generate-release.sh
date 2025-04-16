#!/bin/bash

START_DATE="$1"
VERSION="$2"
FOCUS="$3"
OPEN="$4"

PROMPT_FILE="changelog-prompt.txt"
OUTPUT_FILE="changelog-release.md"

if [ -z "$START_DATE" ] || [ -z "$VERSION" ]; then
  echo "Использование: ./generate-full-changelog.sh <start-date> <version> [focus] [--open]"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Переменная окружения OPENAI_API_KEY не задана"
  exit 1
fi

echo "📥 Сбор закрытых issue после $START_DATE..."

ISSUES=$(
  gh issue list --state closed --limit 1000 --json number,title,body,closedAt \
  --jq ".[] | select(.closedAt >= \"$START_DATE\") | \"#\(.number): \(.title)\n\n\(.body | gsub(\"\\n\"; \" \"))\n\n---\""
)

if [ -z "$ISSUES" ]; then
  echo "❌ Нет закрытых issue после $START_DATE"
  exit 0
fi

# Формирование промпта
cat <<EOF > "$PROMPT_FILE"
Сгенерируй changelog для версии $VERSION.

Правила:
- Начинай changelog заголовком: "# MONO $VERSION"
- Затем добавь краткое текстовое описание релиза (1–3 строки), основанное на комментарии разработчика. Не копируй комментарий дословно. Используй его только как ориентир для формулировки описания.
- Не добавляй ничего от себя, не используй мотивационные или маркетинговые фразы.
- После описания сгруппируй изменения по категориям:
  ✨ Новые функции
  🐛 Исправления ошибок
  🔧 Улучшения
- Каждый пункт списка должен указывать номер issue как markdown-ссылку на https://github.com/coopenomics/mono/issues/Номер (например: [#123](https://github.com/coopenomics/mono/issues/123))
- Пиши кратко, строго и по делу.

EOF

if [ -n "$FOCUS" ]; then
  echo "Комментарий разработчика для описания релиза: $FOCUS" >> "$PROMPT_FILE"
fi

cat <<EOF >> "$PROMPT_FILE"

Ниже список закрытых issues, начиная с $START_DATE:

$ISSUES
EOF

echo "✅ Промпт сохранён в $PROMPT_FILE"

if [ "$OPEN" == "--open" ]; then
  if command -v subl &>/dev/null; then
    subl "$PROMPT_FILE"
  else
    echo "⚠️  'subl' не найден. Установи CLI для Sublime или открой файл вручную."
  fi
fi

echo "📡 Отправка запроса в OpenAI через HTTP-прокси localhost:801..."

PROMPT=$(cat "$PROMPT_FILE" | jq -Rs .)

RESPONSE=$(curl https://api.openai.com/v1/chat/completions \
  -sS \
  -x http://127.0.0.1:801 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"gpt-4.1\",
    \"messages\": [{\"role\": \"user\", \"content\": $PROMPT}],
    \"temperature\": 0.7,
    \"max_tokens\": 10240
  }")

echo "$RESPONSE" | jq -r '.choices[0].message.content' > "$OUTPUT_FILE"

echo "✅ Changelog сохранён в $OUTPUT_FILE"
