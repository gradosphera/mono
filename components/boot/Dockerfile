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
#   1. builder   — full workspace + pnpm install + unbuild
#                  (workspace-deps cooptypes/factory inline'ятся в
#                  bundle, npm-deps остаются external)
#   2. contracts — dicoop/contracts:<tag>
#   3. runtime   — slim node:22 + bundle + npm install --omit=dev
#
# Окружение:
#   CHAIN_URL              — endpoint удалённой ноды
#   CONTRACTS_DIR=/contracts
#   RPC_WAIT_TIMEOUT_MS    — default 120000
#   EOSIO_PUB_KEY / EOSIO_PRV_KEY
#   INSTALL_INITIAL_DATA=1 — опционально mono-данные (нужны MONGO_URI/POSTGRES_*)
#   INSTALL_EXTRA_DATA=1   — то же + расширенный совет

ARG CONTRACTS_TAG=latest

# ─── Stage 1: builder ─────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@10.33.0

COPY . .

RUN pnpm install --frozen-lockfile --filter "@coopenomics/boot..."

# Билд графа: cooptypes/factory собирают свои dist/, boot собирает
# свой bundle с inlined workspace-deps.
RUN pnpm --filter "@coopenomics/boot..." build

# Workspace-deps inline'ятся в bundle, но их транзитивные npm-deps
# (factory тащит handlebars/ajv/mongodb/..., cooptypes пуст) остаются
# external — нужны в финальном node_modules. Мерджим их в boot.deps
# и удаляем сами workspace-spec'и (npm install не понимает workspace:*).
RUN node -e "const fs=require('fs'); \
  const boot=JSON.parse(fs.readFileSync('components/boot/package.json','utf8')); \
  const factory=JSON.parse(fs.readFileSync('components/factory/package.json','utf8')); \
  const cooptypes=JSON.parse(fs.readFileSync('components/cooptypes/package.json','utf8')); \
  boot.dependencies = { ...factory.dependencies, ...cooptypes.dependencies, ...boot.dependencies }; \
  delete boot.dependencies['cooptypes']; \
  delete boot.dependencies['@coopenomics/factory']; \
  fs.writeFileSync('components/boot/package.json', JSON.stringify(boot, null, 2));"

# ─── Stage 2: contracts ───────────────────────────────────────────────
FROM dicoop/contracts:${CONTRACTS_TAG} AS contracts

# ─── Stage 3: runtime ────────────────────────────────────────────────
FROM node:22-slim AS runtime

WORKDIR /app

COPY --from=builder /app/components/boot/package.json ./package.json
COPY --from=builder /app/components/boot/dist ./dist

# Только prod npm-зависимости. --no-package-lock потому что
# pnpm-lock несовместим с npm и в slim-образе не нужен.
RUN npm install --omit=dev --no-package-lock --no-fund --no-audit \
 && npm cache clean --force \
 && rm -rf /root/.npm

COPY --from=contracts /contracts /contracts
ENV CONTRACTS_DIR=/contracts

ENTRYPOINT ["node", "dist/index.cjs"]
CMD ["boot:remote"]
