#!/usr/bin/env bash
#
# Entrypoint для образа ke-bootstrap (`ghcr.io/coopenomics/bootstrap`).
#
# Один и тот же бинарь поддерживает несколько режимов через первый
# аргумент CMD (по умолчанию `boot:remote`). Все режимы — short-lived,
# контейнер выходит после завершения. Перезапускать его при сбое RPC не
# нужно: `boot:remote` сам ждёт готовности ноды по `CHAIN_URL`.
#
# Доступные режимы:
#   boot:remote   — деплой контрактов на уже работающую ноду (default)
#   verify        — sanity-check: вывести версию + список контрактов
#   shell         — открыть bash для отладки (только если контейнер
#                   запущен интерактивно)
#
# В CI (`build-bootstrap.yaml`) `verify` запускается после push'а как
# smoke-test, чтобы убедиться что образ хотя бы стартует.

set -euo pipefail

CMD="${1:-boot:remote}"

# Проверяем минимальный набор обязательных env'ов перед стартом — так
# падение происходит сразу с понятной ошибкой, а не где-то внутри boot
# при попытке подписать транзакцию пустым ключом.
require_env() {
  local var
  for var in "$@"; do
    if [ -z "${!var:-}" ]; then
      echo "ERROR: env $var is required for mode '$CMD'" >&2
      exit 1
    fi
  done
}

case "$CMD" in
  boot:remote)
    require_env CHAIN_URL EOSIO_PUB_KEY EOSIO_PRV_KEY
    echo "[ke-bootstrap] CHAIN_URL=$CHAIN_URL"
    echo "[ke-bootstrap] CONTRACTS_DIR=${CONTRACTS_DIR:-/contracts}"
    echo "[ke-bootstrap] starting boot:remote..."
    # node dist/index.cjs — pnpm deploy укладывает unbuild-output сюда
    exec node /app/dist/index.cjs boot:remote
    ;;

  verify)
    # Smoke-test для CI после push'а образа.
    echo "[ke-bootstrap] node version:"; node --version
    echo "[ke-bootstrap] dist/index.cjs:"; ls -la /app/dist/index.cjs || exit 1
    echo "[ke-bootstrap] CONTRACTS_DIR contents:"; ls /contracts | head -30
    echo "[ke-bootstrap] manifest:"
    if [ -f /contracts/manifest.json ]; then
      cat /contracts/manifest.json
    else
      echo "(missing)"
    fi
    echo "[ke-bootstrap] cli help (sanity-check, RPC недоступен — это ожидаемо):"
    # `--help` не делает RPC-вызовов, только парсит commander
    node /app/dist/index.cjs --help || true
    ;;

  shell)
    exec /bin/bash
    ;;

  *)
    # Любой другой аргумент пробрасываем дальше как arg для node (ESC-hatch
    # для ad-hoc-сценариев типа `docker run ... cleos get info`).
    exec node /app/dist/index.cjs "$@"
    ;;
esac
