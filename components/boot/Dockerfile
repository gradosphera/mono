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
#   1. builder   — full workspace + pnpm install + unbuild (с inline
#                  workspace-deps cooptypes/factory) → dist/index.cjs
#                  + переписанный package.json без workspace-deps
#   2. contracts — dicoop/contracts:<tag>
#   3. runtime   — slim node:22 + dist + npm install --omit=dev
#
# В финальном образе только prod-зависимости с npm registry, без
# pnpm-storage и dev-deps.
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

# Билд всех в графе — boot + транзитивные cooptypes/factory.
RUN pnpm --filter "@coopenomics/boot..." build

# Workspace-deps уже инлайнены в dist (см. build.config.ts) —
# выкидываем их из package.json, чтобы npm install в финальной
# стадии не падал на "workspace:*" specifier.
RUN node -e "const fs=require('fs'); \
  const p=JSON.parse(fs.readFileSync('components/boot/package.json','utf8')); \
  delete p.dependencies['cooptypes']; \
  delete p.dependencies['@coopenomics/factory']; \
  fs.writeFileSync('components/boot/package.json', JSON.stringify(p, null, 2));"

# ─── Stage 2: contracts ───────────────────────────────────────────────
FROM dicoop/contracts:${CONTRACTS_TAG} AS contracts

# ─── Stage 3: runtime ────────────────────────────────────────────────
FROM node:22-slim AS runtime

WORKDIR /app

# package.json без workspace-deps + готовый dist.
COPY --from=builder /app/components/boot/package.json ./package.json
COPY --from=builder /app/components/boot/dist ./dist

# Только prod-зависимости из npm registry. --no-package-lock потому что
# исходный pnpm-lock.yaml несовместим с npm и не нужен в slim-образе.
RUN npm install --omit=dev --no-package-lock --no-fund --no-audit \
 && npm cache clean --force \
 && rm -rf /root/.npm

# Контракты flat-layout в /contracts (configs/contracts.ts читает CONTRACTS_DIR).
COPY --from=contracts /contracts /contracts
ENV CONTRACTS_DIR=/contracts

ENTRYPOINT ["node", "dist/index.cjs"]
CMD ["boot:remote"]
