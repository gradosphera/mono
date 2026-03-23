---
name: coopenomics-full-stack-feature
description: >-
  End-to-end фича в монорепозитории monocoop: контракт → cooptypes → controller
  (GraphQL) → Zeus в SDK → селекторы/запросы/мутации → сборка SDK → desktop.
  Use when the user asks for full-stack flow, «как делать фичу целиком»,
  blockchain + backend + SDK + frontend, or attaches this workflow.
---

# Coopenomics: фича полного цикла

Краткий порядок работ для агента. Не расплываться: идти фазами, не смешивать слои.

## Когда пропускать блокчейн-фазу

Если контракт уже есть или фича только API/UI — начинай с нужной фазы (часто с бэкенда или только SDK+desktop).

---

## Фаза A — блокчейн и типы

1. **Контракт** — `components/contracts/cpp/`, сборка через существующие скрипты пакета `@coopenomics/contracts` (например `build-all.sh`), деплой на ноду по процессу команды.

2. **TS из ABI** — скрипт `components/contracts/types/types-generator.sh`:
   - нужны доступная нода (`get_abi`) и утилита `eosio-abi2ts`;
   - для каждого контракта из списка в скрипте кладёт результат в `components/contracts/types/generated/<contract>.ts`.

3. **cooptypes** — перенести/синхронизировать сгенерированные интерфейсы в `components/cooptypes/src/interfaces/<контракт>.ts` (как у существующих: префикс `I` у экшенов/структур, скаляры `IName`, `IAsset`, …).

4. **Экспорт по контракту** — повторить паттерн `components/cooptypes/src/contracts/<имя>/`:
   - `index.ts`: `export * as Actions`, `export * as Tables`, `export * as Interfaces` из `../../interfaces/<имя>`;
   - `actions/*.ts` + `actions/index.ts` — типы параметров действий;
   - `tables/*.ts` + `tables/index.ts` — строки таблиц;
   - зарегистрировать контракт в `components/cooptypes/src/contracts/index.ts` и при необходимости в `src/index.ts`.

5. **Сборка cooptypes** — `pnpm run build --filter cooptypes` (когда пользователь просит собрать).

**Граница фазы:** домен controller не импортирует `cooptypes`; типы контракта использовать в инфраструктуре/адаптерах (см. правило controller.mdc).

---

## Фаза B — бэкенд (controller)

1. Домен: интерфейсы и логика без `cooptypes`.
2. Инфраструктура: адаптеры блокчейна/БД, здесь допустимы типы из `cooptypes`.
3. Application: DTO (`@ObjectType` / `@InputType`), резолверы, сервисы, модули.
4. **GraphQL-схема** — `components/controller/schema.gql` обновляется вручную или автоматически при старте приложения у пользователя; агент не обязан запускать контроллер ради этого.

---

## Фаза C — клиент Zeus и SDK

1. **Генерация Zeus** из актуального `schema.gql`:
   - в репозитории скрипт пакета controller: `generate-client` (из корня: `pnpm run generate-client --filter @coopenomics/controller`);
   - пишет `components/sdk/src/zeus/` и копирует shared-типы в `components/sdk/src/types/controller`.

2. **SDK** — по правилам `.cursor/rules/sdk.mdc`:
   - селекторы в `components/sdk/src/selectors/…` с `MakeAllFieldsRequired<ValueTypes['…']>`;
   - запросы `components/sdk/src/queries/…`, мутации `components/sdk/src/mutations/…`;
   - имена GraphQL-типов брать из `schema.gql` / сгенерированного Zeus, не угадывать.

3. **Сборка SDK** — `pnpm run build --filter @coopenomics/sdk` (по запросу пользователя).

Порядок жёсткий: сначала схема и `generate-client`, потом руками селекторы и операции, потом build SDK.

---

## Фаза D — desktop (frontend)

1. Использовать только `@coopenomics/sdk`: `client.Query` / `client.Mutation` из `shared/api/client`.
2. Соблюдать FSD desktop, Pug + Composition API, правила из `AGENTS.md` / `.cursor/rules/desktop.mdc`.

---

## Чеклист для пользователя (копипаст)

```
[ ] A: контракт собран и задеплоен
[ ] A: types-generator.sh → interfaces + contracts/* в cooptypes
[ ] B: controller: домен / инфра / резолверы / schema.gql
[ ] C: pnpm run generate-client --filter @coopenomics/controller
[ ] C: SDK селекторы + queries/mutations
[ ] C: pnpm run build --filter @coopenomics/sdk
[ ] D: desktop на обновлённом SDK
```

## Дополнительно

- Пакеты в монорепе: только `pnpm add … --filter <пакет>` с корня.
- Точные имена скриптов смотреть в `components/controller/package.json` и `components/cooptypes/package.json` — при переименовании скилл не догоняет автоматически.
