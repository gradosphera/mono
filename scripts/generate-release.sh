#!/bin/bash

INFO_FILE="release-info.md"
PROMPT_FILE="changelog-prompt.md"
OUTPUT_FILE="changelog-release.md"

if [ ! -f "$INFO_FILE" ]; then
  echo "❌ Файл $INFO_FILE не найден"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Переменная окружения OPENAI_API_KEY не задана"
  exit 1
fi

# Извлекаем данные
VERSION=$(grep "^VERSION:" "$INFO_FILE" | cut -d':' -f2- | xargs)
START_DATE=$(grep "^FROM DATE:" "$INFO_FILE" | cut -d':' -f2- | xargs)
COMMENT=$(awk '/^COMMENT:/{flag=1; next} /^ *$/{flag=0} flag' "$INFO_FILE")

if [ -z "$VERSION" ] || [ -z "$START_DATE" ]; then
  echo "❌ В файле $INFO_FILE должны быть строки: VERSION и FROM DATE"
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

# Формируем промпт
cat <<EOF > "$PROMPT_FILE"
Сгенерируй changelog для версии $VERSION.

Правила:
- Начинай changelog заголовком: "# $VERSION"
- Затем добавь краткое текстовое описание релиза (1–3 строки), основанное на комментарии разработчика. Не копируй комментарий дословно. Используй его только как ориентир для формулировки описания.
- Не добавляй ничего от себя, не используй мотивационные или маркетинговые фразы.
- После описания сгруппируй изменения по категориям:
  ✨ Новые функции
  🐛 Исправления ошибок
  🔧 Улучшения
- Каждый пункт списка должен быть в формате:
  - [#Номер](https://github.com/coopenomics/mono/issues/Номер): Краткое описание
- Пиши кратко, строго и по делу.
- В конце поставь тег: #releases

Комментарий разработчика для описания релиза:
$COMMENT

Ниже список закрытых issues, начиная с $START_DATE:

$ISSUES
EOF

echo "✅ Промпт сохранён в $PROMPT_FILE"
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

RELEASE_BODY=$(echo "$RESPONSE" | jq -r '.choices[0].message.content')
echo "$RELEASE_BODY" > "$OUTPUT_FILE"

echo "✅ Changelog сохранён в $OUTPUT_FILE"
