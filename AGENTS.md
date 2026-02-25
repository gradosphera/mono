# AGENTS.md

## Cursor Cloud specific instructions

### Обзор проекта

Это pnpm-монорепозиторий «Цифровой Кооператив» (monocoop) — платформа управления кооперативами на блокчейне EOSIO. Основные компоненты находятся в `components/`.

### Ключевые сервисы

| Компонент | Порт | Тип | Описание |
|-----------|------|-----|----------|
| controller | 2998 | NestJS GraphQL API | Бэкенд, основной API |
| desktop | 3005 | Vue 3 + Quasar SSR | Фронтенд |
| parser | 4000 | Blockchain parser | Индексация событий блокчейна |
| node (Docker) | 8888 | EOSIO blockchain | Нода блокчейна |
| mongo (Docker) | 27017 | MongoDB | Основная БД |
| redis (Docker) | 6379 | Redis | Кэш и стримы |
| postgres (Docker) | 5432 | PostgreSQL | Реляционная БД |

### Запуск инфраструктуры

1. **Docker-сервисы**: `docker compose up -d` из корня (использует `docker-compose.yaml` + `docker-compose.override.yaml`).
   - **Важно**: `postgres:latest` (v18+) не работает с текущей конфигурацией volume. Используйте `docker-compose.override.yaml` с `image: postgres:16`.
2. **Bootstrap системы**: Команда `pnpm run boot` создаёт совет только с 1 членом, но смарт-контракт требует минимум 5. Используйте `pnpm --filter @coopenomics/boot run boot:extra` для полной инициализации с расширенным советом (5 членов).
3. Перед boot нужно собрать shared-библиотеки: `cooptypes`, `factory`, `sdk`, `notifications` (см. ниже).
4. Перед boot нужно собрать смарт-контракты: `cd components/contracts && bash build-all.sh`.

### Сборка shared-библиотек (порядок зависимостей)

```
pnpm --filter cooptypes run build
pnpm --filter @coopenomics/factory run build
pnpm --filter @coopenomics/sdk run build
pnpm --filter @coopenomics/notifications run build
```

### Конфигурация окружения

Каждый сервис требует `.env` файл, скопированный из `.env-example`:
- `components/controller/.env` — нужен `VAPID_PUBLIC_KEY` и `VAPID_PRIVATE_KEY` (генерируются: `node -e "const wp = require('web-push'); const k = wp.generateVAPIDKeys(); console.log(k)"` из папки controller)
- `components/desktop/.env`
- `components/parser/.env`
- `components/boot/.env`

### Dev-команды

- **Все сервисы**: `pnpm run dev:all` (через lerna)
- **Бэкенд**: `pnpm run dev:backend` (controller + parser)
- **Фронтенд**: `pnpm run dev:desktop`
- **Библиотеки (watch)**: `pnpm run dev:lib`

### Линтинг и тесты

- **controller**: `pnpm --filter @coopenomics/controller run lint` (eslint), `pnpm --filter @coopenomics/controller run test` (jest)
- **sdk**: `pnpm --filter @coopenomics/sdk run lint` / `pnpm --filter @coopenomics/sdk run test` (vitest)
- **factory**: `pnpm --filter @coopenomics/factory run lint` / `pnpm --filter @coopenomics/factory run test` (vitest)
- **desktop**: `pnpm --filter @coopenomics/desktop run lint`

### Gotchas

- Node.js **v20** обязателен (Dockerfile использует `node:20-slim`). v22 не тестировался.
- pnpm **v9.x** (не v10). В проекте `packageManager: pnpm@9.9.0`.
- Установка пакетов через фильтр: `pnpm add <pkg> --filter <component>`.
- `components/boot/wallet-data/` и `components/boot/blockchain-data/` создаются Docker'ом от root — может потребоваться `sudo chown`.
- Скрипты `reboot.sh` / `extra_reboot.sh` из `components/boot/scripts/` вызывают `docker compose` из своей директории, где нет `docker-compose.yaml` — работают только если Docker Compose находит конфигурацию выше по дереву.
