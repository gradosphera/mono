# Образ-bootstrap для удалённой ноды.
#
# Назначение: one-shot job в чужом docker-compose рядом с уже
# запущенным `node`-сервисом (dicoop/blockchain). Bootstrap
# дожидается готовности RPC, после чего вкатывает на ноду все
# системные и кооперативные контракты, активирует протокол-фичи,
# создаёт системный токен и инициализирует system/emission/powerup.
#
# Контракты НЕ собираются здесь — они тянутся multi-stage из
# готового артефакта `dicoop/contracts:<tag>`.
#
# Сборка идёт в три стадии:
#   1. builder  — full workspace + pnpm install + unbuild → dist/
#                 + pnpm deploy --prod /deploy (только prod node_modules + dist)
#   2. contracts (alias) — dicoop/contracts:<tag>
#   3. runtime  — slim node:22 + COPY /deploy + COPY /contracts
#
# Финальный образ содержит только:
#   - dist/index.cjs (бандл boot, unbuild)
#   - node_modules только prod-зависимостей boot'а
#   - /contracts из dicoop/contracts (~40MB)
#
# Окружение:
#   CHAIN_URL              — endpoint удалённой ноды (например http://node:8888)
#   CONTRACTS_DIR=/contracts (выставлено по умолчанию)
#   RPC_WAIT_TIMEOUT_MS    — сколько ждать RPC (default 120000)
#   EOSIO_PUB_KEY / EOSIO_PRV_KEY  — ключи системного аккаунта eosio
#   INSTALL_INITIAL_DATA=1 — опционально доставить mono-данные (нужны MONGO_URI/POSTGRES_*)
#   INSTALL_EXTRA_DATA=1   — то же + расширенный совет

ARG CONTRACTS_TAG=latest

# ─── Stage 1: builder ─────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@10.33.0

# Тащим workspace целиком — pnpm-workspace.yaml ожидает components/*.
COPY . .

# Ставим только boot и его транзитивные workspace-deps (cooptypes, factory).
RUN pnpm install --frozen-lockfile --filter "@coopenomics/boot..."

# unbuild → dist/index.{mjs,cjs} для boot + транзитивных
# workspace-deps (cooptypes, factory). Иначе runtime падает с
# "Cannot find module '@coopenomics/factory/dist/index.cjs'".
RUN pnpm --filter "@coopenomics/boot..." build

# pnpm deploy --prod собирает self-contained директорию: только prod
# node_modules (без dev) + копия пакета. Workspace-deps ресолвятся в файлы.
RUN pnpm --filter @coopenomics/boot deploy --prod --legacy /deploy

# ─── Stage 2: contracts ───────────────────────────────────────────────
FROM dicoop/contracts:${CONTRACTS_TAG} AS contracts

# ─── Stage 3: runtime ────────────────────────────────────────────────
FROM node:22-slim AS runtime

WORKDIR /app

# Self-contained boot: dist/ + prod node_modules + package.json.
COPY --from=builder /deploy /app

# Контракты flat-layout в /contracts (configs/contracts.ts читает CONTRACTS_DIR).
COPY --from=contracts /contracts /contracts
ENV CONTRACTS_DIR=/contracts

# По умолчанию sideboot режим — против внешней ноды, без docker-управления.
# Прямой запуск собранного бандла, без pnpm/esno-обёртки.
ENTRYPOINT ["node", "dist/index.cjs"]
CMD ["boot:remote"]
