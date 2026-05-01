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
#   1. builder   — full workspace + pnpm install + unbuild с
#                  inlineDependencies:true → один dist/index.cjs со
#                  всеми зависимостями zip'нутыми внутрь
#   2. contracts — dicoop/contracts:<tag>
#   3. runtime   — slim node:22 + ОДИН файл dist/index.cjs + /contracts
#
# В финальном образе нет node_modules вообще — только bundle и runtime.
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

COPY . .

RUN pnpm install --frozen-lockfile --filter "@coopenomics/boot..."

# Билд всего графа — boot + транзитивные cooptypes/factory.
# inlineDependencies:true запихивает все imports в один bundle.
RUN pnpm --filter "@coopenomics/boot..." build

# ─── Stage 2: contracts ───────────────────────────────────────────────
FROM dicoop/contracts:${CONTRACTS_TAG} AS contracts

# ─── Stage 3: runtime ────────────────────────────────────────────────
FROM node:22-slim AS runtime

WORKDIR /app

# Bundle со всеми deps внутри — больше ничего не нужно.
COPY --from=builder /app/components/boot/dist/index.cjs ./index.cjs

# Контракты flat-layout в /contracts (configs/contracts.ts читает CONTRACTS_DIR).
COPY --from=contracts /contracts /contracts
ENV CONTRACTS_DIR=/contracts

ENTRYPOINT ["node", "index.cjs"]
CMD ["boot:remote"]
