# ke-bootstrap: образ-оркестратор первичного деплоя контрактов на KE-ноду.
#
# Назначение:
#   Один раз при поднятии узла (testnet/local-dev) этот контейнер ждёт
#   готовности RPC `${CHAIN_URL}/v1/chain/get_info`, затем запускает
#   `boot:remote` — деплоит все контракты из примонтированного образа
#   `dicoop/contracts` через RPC (`eosjs::setContract`), активирует
#   protocol features, создаёт системный токен и т.д. После завершения
#   контейнер выходит с кодом 0.
#
# Не управляет docker-контейнером ноды (в отличие от `boot`/`boot:clean`/
# `boot:extra` — тех режимов, что вызывают `dockerode` для запуска ноды
# рядом с собой). Нода поднимается отдельным сервисом docker-compose
# (`dicoop/blockchain_v5.1.1`), и зависимость декларируется через
# `depends_on: ke-node: service_healthy`.
#
# Параметры (env):
#   CHAIN_URL              — URL RPC ноды (default `http://localhost:8888`).
#   EOSIO_PUB_KEY          — public key для системных аккаунтов (обязателен).
#   EOSIO_PRV_KEY          — private key для подписи (обязателен).
#   PASSWORD               — пароль для cleos-wallet (используется командой `unlock`).
#   CONTRACTS_DIR          — корень wasm/abi (default `/contracts`).
#   RPC_WAIT_TIMEOUT_MS    — таймаут ожидания RPC (default 120000).
#   INSTALL_INITIAL_DATA=1 — опционально: записать кооператив `voskhod` в
#                            MongoDB+PostgreSQL (требует `MONGO_URI`,
#                            `PG_HOST`/`PG_USER`/...). Без этого флага
#                            bootstrap делает только on-chain работу.
#   INSTALL_EXTRA_DATA=1   — то же + расширенный совет (4 доп. пайщика).
#
# Layout слоёв:
#   Stage 1 (deps)        — `pnpm install` всего workspace, нужен для
#                           workspace-зависимостей `@coopenomics/factory`,
#                           `cooptypes` (boot их импортирует).
#   Stage 2 (build)       — `pnpm run build` для cooptypes/factory/boot
#                           (unbuild → dist/index.cjs + .mjs).
#   Stage 3 (deploy)      — `pnpm deploy --filter @coopenomics/boot --prod`
#                           складывает приложение + только prod-deps в /app.
#                           workspace:* → реальные пакеты, без cross-link.
#   Stage 4 (contracts)   — alias для `dicoop/contracts:<tag>`, отсюда
#                           берутся wasm/abi через `COPY --from`.
#   Stage 5 (runtime)     — slim node:20-alpine, `/app` + `/contracts`.

# Глобальный ARG до первого FROM — иначе он не виден в FROM следующих
# стадий (BuildKit делает ARG, объявленный после FROM, локальным для
# предыдущей стадии).
ARG CONTRACTS_TAG=dev

# ── Stage 1: install dependencies ────────────────────────────────────
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.0.6 --activate \
 && apk add --no-cache git python3 make g++

WORKDIR /repo

# Workspace-конфиг + lockfile + корневой package.json — нужны pnpm для
# построения графа workspace до того, как мы скопируем компоненты.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml lerna.json ./

# Рабочие пакеты, нужные для boot:
#   - cooptypes / factory      — workspace:* зависимости
#   - boot                     — собственно сборка
COPY components/cooptypes/ ./components/cooptypes/
COPY components/factory/   ./components/factory/
COPY components/boot/      ./components/boot/

RUN pnpm install --frozen-lockfile

# ── Stage 2: build TS пакетов ────────────────────────────────────────
FROM deps AS build

# Порядок сборки важен: cooptypes → factory → boot (downstream зависят
# от dist/ upstream-пакетов). Lerna-граф решает это автоматически через
# --include-dependencies, но явное перечисление дешевле и предсказуемее.
RUN pnpm --filter cooptypes run build \
 && pnpm --filter @coopenomics/factory run build \
 && pnpm --filter @coopenomics/boot run build

# ── Stage 3: pnpm deploy → standalone /app ───────────────────────────
FROM build AS deploy

# `pnpm deploy --prod` создаёт автономную копию пакета с разрешёнными
# `workspace:*` зависимостями (тянет реальные пакеты из workspace, не
# симлинки). devDeps отрезаются, так что esno/typescript/vitest не
# попадают в финальный образ.
RUN pnpm deploy --filter @coopenomics/boot --prod /app

# ── Stage 4: contracts (wasm/abi артефакты) ──────────────────────────
# Тег этого образа должен совпадать с тегом ke-bootstrap (см.
# `.github/workflows/build-bootstrap.yaml`). Multi-stage `COPY` не
# зависит от того, что dicoop/contracts что-то делает в ENTRYPOINT —
# нам нужен только filesystem. ARG объявлен в самом начале файла
# (до первого FROM) — здесь только используется.
FROM dicoop/contracts:${CONTRACTS_TAG} AS contracts

# ── Stage 5: runtime ─────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# bash + curl — entrypoint использует bash (set -e, конструкции `[[ ]]`)
# и опционально curl для дебага healthcheck'а.
RUN apk add --no-cache bash curl

# Приложение
COPY --from=deploy /app /app

# Артефакты контрактов (flat layout: /contracts/<name>/<name>.{wasm,abi})
COPY --from=contracts /contracts /contracts

# Entrypoint скрипт лежит в исходниках boot, копируем отдельно
COPY components/boot/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app

# Дефолтные env. CHAIN_URL переопределяется в docker-compose, остальное
# — sane defaults для bootstrap-сценария.
ENV CONTRACTS_DIR=/contracts \
    CHAIN_URL=http://ke-node:8888 \
    RPC_WAIT_TIMEOUT_MS=120000

LABEL org.opencontainers.image.title="coopenomics-bootstrap"
LABEL org.opencontainers.image.description="One-shot bootstrapper для KE-ноды: ждёт RPC, деплоит контракты и инициализирует протокол"
LABEL org.opencontainers.image.source="https://github.com/coopenomics/mono"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["boot:remote"]
