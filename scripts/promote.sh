#!/bin/bash
set -e

# Fast-forward промоушн БЕЗ merge: target-ветка просто двигается на коммит
# source-ветки. testnet и main не несут собственных коммитов — это указатели на
# протестированный коммит dev. Ветки не диверджатся → конфликты невозможны.
#
#   scripts/promote.sh testnet   # dev      → testnet (staging-деплой)
#   scripts/promote.sh main      # testnet  → main    (production-деплой)
#
# Если push отвергнут как non-fast-forward — это ГАРД, не баг: значит в target
# попал прямой коммит, и target обогнал source. Выровняй вручную (в testnet/main
# прямых коммитов быть не должно — только FF-промоушн).

TARGET="$1"
case "$TARGET" in
  testnet) SOURCE="dev" ;;
  main)    SOURCE="testnet" ;;
  *)
    echo "Использование: $0 <testnet|main>"
    exit 1
    ;;
esac

git fetch origin

echo "FF-промоушн: origin/$SOURCE → origin/$TARGET"

# Server-side fast-forward: двигаем удалённый $TARGET на коммит удалённого $SOURCE.
# Рабочее дерево не трогаем (никаких checkout/merge). Без --force: сервер
# отвергнет, если это не fast-forward.
git push origin "origin/${SOURCE}:refs/heads/${TARGET}"

if [ "$TARGET" = "main" ]; then
  ENV_LABEL="PRODUCTION (+ npm publish + доки)"
else
  ENV_LABEL="staging/testnet"
fi

echo
echo "Готово. origin/$TARGET = origin/$SOURCE."
echo "CI задеплоит: $ENV_LABEL."
