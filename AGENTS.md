# AGENTS.md

## Cursor Cloud specific instructions

### Обзор проекта

Монорепозиторий «Цифровой Кооператив» (monocoop) — платформа управления кооперативами на блокчейне EOSIO. pnpm + Lerna. Компоненты в `components/`.

### Сервисы

| Компонент | Порт | Описание |
|-----------|------|----------|
| controller (coopback) | 2998 | NestJS GraphQL API |
| desktop | 3005 | Vue 3 + Quasar (SPA/SSR) |
| parser (cooparser) | 4000 | Индексация блокчейна через SHiP |
| node (Docker) | 8888 | EOSIO blockchain node |
| mongo (Docker) | 27017 | MongoDB (replica set) |
| redis (Docker) | 6379 | Redis |
| postgres (Docker) | 5432 | PostgreSQL 16 |
| SHiP (Docker) | 8070 | State History Plugin WebSocket |

### Полный цикл запуска dev-окружения

1. **Сборка shared-библиотек** (порядок важен):
   ```
   pnpm --filter cooptypes run build
   pnpm --filter @coopenomics/factory run build
   pnpm --filter @coopenomics/sdk run build
   pnpm --filter @coopenomics/notifications run build
   ```

2. **Сборка смарт-контрактов** (test-режим позволяет boot с 1 членом совета):
   ```
   cd components/contracts && bash build-all.sh test
   ```

3. **Запуск инфраструктуры**:
   ```
   docker compose up -d mongo postgres redis node
   ```

4. **Bootstrap системы**:
   ```
   pnpm run boot
   ```

5. **Запуск парсера** (после boot; при первом запуске нужен `START_BLOCK=2` в `.env` для полного replay, потом вернуть `START_BLOCK=1`):
   ```
   pnpm --filter @coopenomics/parser run dev
   ```

6. **Запуск controller и desktop**:
   ```
   pnpm --filter @coopenomics/controller run dev
   pnpm --filter @coopenomics/desktop run dev
   ```

### Критические gotchas

- **Node.js v20** обязателен. pnpm **v9.x** (не v10).
- **SHiP порт 8070** — конфиг ноды `state-history-endpoint = 0.0.0.0:8070`, НЕ 8080. В `.env` парсера: `SHIP=ws://127.0.0.1:8070`.
- **CHAIN_ID** должен совпадать во всех `.env` файлах. Локальный chain_id: `cae86058a6d8698833afb474ab8a5ad8599c6cf54f9ebcf275dbac7055c16fe1`. В `.env-example` desktop стоял неправильный — исправлен.
- **postgres:latest (v18+)** не работает с текущей конфигурацией volume — используется `postgres:16`.
- **WeasyPrint** — системная зависимость для генерации PDF документов. Нужен в PATH: `pip install WeasyPrint==67`.
- **SSR-режим desktop в dev** — расширения (extensions) не рендерятся в SSR dev-сервере из-за проблемы гидратации Pinia: Vue-компоненты из маршрутов расширений сериализуются в `__INITIAL_STATE__` как plain-объекты `{__name, __file}` без render/setup функций. При гидратации клиент использует эти сломанные компоненты. Production-сборка (`quasar build --mode ssr`) работает корректно. **Для dev используйте SPA-режим**: `quasar dev` (без `--mode ssr`). Корневое решение: вынести `routes` из Pinia-стейта desktop-store, чтобы они не сериализовались при SSR.
- **Парсер и START_BLOCK**: при `START_BLOCK=1` на чистой БД парсер стартует с HEAD и вызывает `initializeFromBlockchain()` (загружает только кооператив и шаблоны, НЕ аккаунты). Для полного replay данных boot установите `START_BLOCK=2`, запустите, потом верните `START_BLOCK=1`.
- **boot/wallet-data и boot/blockchain-data** — создаются Docker от root, может потребоваться `sudo chown`.
- **Reboot-скрипты** (`components/boot/scripts/reboot.sh` и др.) ссылаются на docker-compose сервисы `cooparser` и `coopback`.
- **Тестовые учётные данные** (после boot): email `ivanov@example.com`, ключ `5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3`, пользователь `ant` (председатель).
