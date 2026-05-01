# Образ-bootstrap для удалённой ноды.
#
# Назначение: one-shot job в чужом docker-compose рядом с уже
# запущенным `node`-сервисом (dicoop/blockchain). Bootstrap
# дожидается готовности RPC, после чего вкатывает на ноду все
# системные и кооперативные контракты, активирует протокол-фичи,
# создаёт системный токен и инициализирует system/emission/powerup.
#
# Контракты НЕ собираются здесь — они тянутся multi-stage из
# готового артефакта `dicoop/contracts:<tag>` (см. workflow
# build-contracts.yaml) и кладутся в /contracts. CLI находит их
# через CONTRACTS_DIR.
#
# Окружение:
#   CHAIN_URL              — endpoint удалённой ноды (например http://node:8888)
#   CONTRACTS_DIR=/contracts (выставлено по умолчанию)
#   RPC_WAIT_TIMEOUT_MS    — сколько ждать RPC (default 120000)
#   EOSIO_PUB_KEY / EOSIO_PRV_KEY  — ключи системного аккаунта eosio
#   INSTALL_INITIAL_DATA=1 — опционально доставить mono-данные (нужны MONGO_URI/POSTGRES_*)
#   INSTALL_EXTRA_DATA=1   — то же + расширенный совет
#
# Применение в стороннем compose:
#   services:
#     node:
#       image: dicoop/blockchain:latest
#       ports: ["8888:8888"]
#     bootcoop:
#       image: dicoop/bootcoop:dev
#       depends_on: [node]
#       environment:
#         CHAIN_URL: http://node:8888
#         EOSIO_PUB_KEY: EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
#         EOSIO_PRV_KEY: 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3
#       restart: "no"

ARG CONTRACTS_TAG=latest
ARG MONO_BASE_TAG=latest

FROM dicoop/contracts:${CONTRACTS_TAG} AS contracts

FROM dicoop/mono-base:${MONO_BASE_TAG} AS runtime

# Контракты из готового артефакта в flat-layout
# (configs/contracts.ts читает из CONTRACTS_DIR).
COPY --from=contracts /contracts /contracts
ENV CONTRACTS_DIR=/contracts

WORKDIR /app/components/boot

# По умолчанию sideboot режим — против внешней ноды, без docker-управления.
# Переопределить можно: docker run dicoop/bootcoop:dev pnpm run boot:remote
# или подменив CMD/entrypoint в compose.
ENTRYPOINT ["pnpm", "run"]
CMD ["boot:remote"]
