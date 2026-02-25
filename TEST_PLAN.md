# Test Plan — pnpm run test

## Цель
Единая команда `pnpm run test` для CI/CD, запускающая:
1. Функциональные тесты компонентов (unit/functional)
2. Интеграционные тесты через boot (blockchain + services)

## Компоненты и состояние тестов

### 1. cooptypes (vitest)
- **Файлы**: `test/index.test.ts`
- **Состояние**: ❌ Пустой файл (всё закомментировано)
- **Действие**: Удалить содержимое, создать минимальный smoke-тест экспортов
- **Статус**: [ ] TODO

### 2. factory (vitest)
- **Файлы**: 8 тестов: index, wallet, blagorost, market, meet, search, udata, documents-1000-plus
- **Состояние**: ⚠️ Работает частично. Требует MongoDB + blockchain node. `mongoUri` хардкожен как `127.0.0.1:27017`
- **Действие**: Обновить mongoUri на `mongo:27017` (docker hostname). Проверить какие тесты проходят после boot.
- **Статус**: [ ] TODO

### 3. sdk (vitest)
- **Файлы**: `test/index.test.ts`
- **Состояние**: ⚠️ Требует запущенный controller. chain_id хардкожен неправильный.
- **Действие**: Исправить chain_id и api_url. Тесты интеграционные — запускать после boot.
- **Статус**: [ ] TODO

### 4. controller (jest)
- **Файлы**: 6 integration, 4 unit
- **Состояние**: ❌ Устаревшие. Импортируют `../../src/app` (старая Express-структура до NestJS). Не запустятся.
- **Действие**: Удалить устаревшие integration-тесты. Unit-тесты: проверить, удалить нерабочие.
- **Статус**: [ ] TODO

### 5. parser (vitest)
- **Файлы**: `test/index.test.ts`
- **Состояние**: ❌ Полностью закомментирован
- **Действие**: Удалить содержимое, создать smoke-тест или пометить как skip
- **Статус**: [ ] TODO

### 6. boot (vitest — нет test script!)
- **Файлы**: 4 теста: capital, capital-import, registrator, wallet
- **Состояние**: ⚠️ capital.test — рабочий (по словам пользователя). Остальные — ХЗ/устаревшие.
- **Действие**: Добавить test script в package.json. Проверить capital.test. Остальные — проверить, удалить нерабочие.
- **Статус**: [ ] TODO

### 7. desktop
- **Состояние**: Нет тестов (echo "No test specified")
- **Действие**: Оставить как есть, пометить skip
- **Статус**: [ ] SKIP

### 8. notifications
- **Состояние**: Нет тестов, нет test script
- **Действие**: Оставить как есть
- **Статус**: [ ] SKIP

### 9. contracts, cleos, docs, migrator, setup
- **Состояние**: Нет тестов
- **Действие**: Не трогать
- **Статус**: [ ] SKIP

## Архитектура запуска

```
pnpm run test
├── Phase 1: Unit/Functional тесты (не требуют инфраструктуры)
│   ├── cooptypes (vitest)
│   └── controller unit tests (jest) — если останутся рабочие
│
├── Phase 2: Компонентные тесты (требуют MongoDB + blockchain)
│   ├── factory (vitest) — генерация документов
│   └── parser (vitest) — если есть рабочие
│
└── Phase 3: Интеграционные тесты (требуют полного окружения после boot)
    ├── boot tests (vitest) — capital, wallet, registrator
    └── sdk (vitest) — API через controller
```

## Root test script (package.json)
```json
"test": "lerna run test --scope cooptypes --scope @coopenomics/factory --scope @coopenomics/controller && lerna run test --scope @coopenomics/boot --scope @coopenomics/sdk"
```
