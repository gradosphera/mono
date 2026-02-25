# Test Plan — pnpm run test

## Архитектура
```
pnpm run test
├── cooptypes    — vitest run (smoke tests exports)           ✅ 4/4
├── parser       — vitest run (config smoke tests)            ✅ 3/3
├── factory      — vitest run (document generation tests)     🔧 17/85 → need mocks
├── sdk          — vitest run (API integration tests)         🔧 TODO
├── notifications — vitest run (workflow tests)               🔧 TODO
├── controller   — jest / vitest (NestJS unit tests)          🔧 TODO
└── boot         — vitest run (blockchain integration)        🔧 53/60
```

## Статус по компонентам

### cooptypes ✅ DONE
- 4 smoke-теста экспортов
- Не требует инфраструктуры

### parser ✅ DONE
- 3 smoke-теста конфигурации
- Не требует инфраструктуры

### factory 🔧 IN PROGRESS
- **Проблема**: тесты обращаются к parser API (`SIMPLE_EXPLORER_API`) для get-tables/get-actions
- **Решение**: Уже есть мок-система в `src/Utils/testMocks.ts` + `matchMock.ts`
- **Нужно**: Добавить моки для ВСЕХ документов:
  - [ ] cooperative data mock (registrator.coops table)
  - [ ] soviet boards mock — уже есть через test setup в MongoDB
  - [ ] draft templates mock (draft.drafts + draft.translations tables)
  - [ ] decision data mocks (soviet.decisions table)
  - [ ] Мок для ReturnByMoney документов
  - [ ] Все документы 1000+ серии
- **Текущие рабочие моки**: meet tables, votefor actions, returnByMoneyDecision actions
- **После мокирования**: все 85 тестов должны проходить

### boot 🔧 NEEDS REBOOT
- capital.test — 53/60 тестов проходят (после чистого reboot)
- wallet.test — нужен полный boot с agreements
- registrator.test — нужен полный boot
- capital-import.test — отдельный тест импорта
- **Требует**: pnpm run reboot перед запуском

### sdk 🔧 TODO
- 1 тест файл с login + fetch extensions
- Требует запущенный controller
- Нужно: обновить chain_id, api_url, credentials

### controller 🔧 TODO
- Все старые тесты удалены (устаревшие)
- NestJS-приложение — нужны тесты через @nestjs/testing
- Минимум: unit-тесты domain-логики, smoke-тест GraphQL API

### notifications 🔧 TODO
- Нет тестов
- Нужно: smoke-тесты workflow builder

### desktop — SKIP (нет тестов, UI-тестирование)

## Root script требования
- `pnpm run test` — запускает ВСЕ тесты
- fail-fast: если один пакет падает — весь pipeline падает
- Последовательный запуск (не параллельный)
