#!/bin/bash
set -e

# Независимый деплой по окружениям. testnet и main — НЕ паровоз: каждый из них
# самостоятельный fast-forward-указатель на выбранный релизный тег dev. Можно
# катить в прод и в тест разным темпом и на разные версии одновременно —
# расхождений и конфликтов нет, потому что оба указателя живут на ЛИНЕЙНОЙ
# истории dev (двигаются только вперёд по FF).
#
#   scripts/promote.sh testnet              # последний релиз (тег) → testnet
#   scripts/promote.sh main                 # последний релиз (тег) → main
#   scripts/promote.sh main v2026.6.16      # конкретную версию → main
#   scripts/promote.sh main testnet         # ровно то, что сейчас на testnet → main
#
# REF по умолчанию — последний релизный тег, достижимый из origin/dev (его вешает
# scripts/cut-release.sh). Деплой стартует push'ем в ветку с изменением lerna.json
# (бамп-коммит входит в диапазон FF) — слушает .github/workflows/release.yaml.
#
# Только FF (без --force): сервер отвергнет non-fast-forward — это ГАРД, не баг
# (в target попал прямой коммит, либо ты пытаешься откатить ветку назад).
# Откат на более старую версию или редеплой без движения ветки — через
# workflow_dispatch в release.yaml (inputs: environment + ref), НЕ через этот скрипт.

usage() { echo "Использование: $0 <testnet|main> [<версия|ref>]"; }

TARGET="$1"
case "$TARGET" in
  testnet | main) ;;
  *)
    usage
    exit 1
    ;;
esac

git fetch --tags --force origin

REF="$2"
if [ -z "$REF" ]; then
  # Последний релизный тег на линии origin/dev (vYYYY.M.D[-N] от cut-release.sh).
  REF="$(git describe --tags --abbrev=0 origin/dev)"
fi

# REF может быть именем ветки (testnet/main/dev), тегом или sha — разрешаем единообразно.
if git show-ref --verify --quiet "refs/remotes/origin/$REF"; then
  SRC="origin/$REF"
else
  SRC="$REF"
fi

REF_SHA="$(git rev-parse --verify "${SRC}^{commit}")"
REF_VERSION="$(git show "${REF_SHA}:lerna.json" \
  | sed -nE 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' | head -1)"

echo "Деплой: $REF (v${REF_VERSION}) → $TARGET"

# Server-side fast-forward: двигаем удалённый TARGET на REF. Рабочее дерево не трогаем
# (никаких checkout/merge). Без --force: сервер отвергнет, если это не fast-forward.
git push origin "${REF_SHA}:refs/heads/${TARGET}"

if [ "$TARGET" = "main" ]; then
  ENV_LABEL="PRODUCTION (+ npm publish + доки)"
else
  ENV_LABEL="staging/testnet"
fi

echo
echo "Готово. origin/$TARGET = $REF (v${REF_VERSION})."
echo "CI задеплоит: $ENV_LABEL."
