# @coopenomics/notifications

## Назначение

Библиотека типобезопасных workflow-уведомлений для Novu. Определяет 21 workflow уведомлений (email, in-app, push), валидирует payload через Zod-схемы и синхронизирует определения с Novu API.

## Структура

```
src/
├── index.ts             — Главный экспорт: Types, WorkflowBuilder, Workflows, defaults
├── base/
│   ├── workflow-builder.ts — WorkflowBuilder<T> — билдер для создания workflow
│   └── defaults.ts      — Фабрики шагов: createEmailStep, createInAppStep, createPushStep
│                          Настройки preferences по умолчанию
├── types/
│   └── index.ts         — Типы: WorkflowDefinition, WorkflowStep, PayloadSchema,
│                          BaseWorkflowPayload, NovuWorkflowData, PreferencesConfig
├── workflows/           — 21 workflow, каждый в своей директории
│   ├── index.ts         — Реестр: allWorkflows[], workflowsById{}, экспорт всех
│   ├── welcome/         — Приветственное уведомление
│   ├── email-verification/ — Подтверждение email
│   ├── reset-key/       — Сброс ключа
│   ├── invite/          — Приглашение
│   ├── approval-request/ — Запрос на одобрение
│   ├── approval-response/ — Ответ на запрос одобрения
│   ├── decision-approved/ — Решение одобрено
│   ├── decision-expired/ — Решение истекло
│   ├── incoming-transfer/ — Входящий перевод
│   ├── payment-paid/    — Платёж оплачен
│   ├── payment-cancelled/ — Платёж отменён
│   ├── new-initial-payment-request/ — Запрос начального платежа
│   ├── new-deposit-payment-request/ — Запрос депозита
│   ├── new-agenda-item/ — Новый пункт повестки
│   ├── meet-initial/    — Собрание создано
│   ├── meet-reminder-start/ — Напоминание о начале собрания
│   ├── meet-started/    — Собрание началось
│   ├── meet-reminder-end/ — Напоминание о завершении собрания
│   ├── meet-restart/    — Собрание перезапущено
│   ├── meet-ended/      — Собрание завершено
│   └── server-provisioned/ — Сервер создан
├── sync/
│   ├── sync-runner.ts   — CLI для синхронизации workflow с Novu API
│   │                      --dev: режим watch (chokidar), production: одноразовая синхронизация
│   └── novu-sync.service.ts — NovuSyncService: upsert workflow в Novu через REST API
└── utils/
    └── slugify/         — Транслитерация русских названий → латинские slug ID
```

## Ключевые концепции

### Паттерн WorkflowBuilder

Каждый workflow создаётся через fluent-builder:
```typescript
const workflow = WorkflowBuilder
  .create<IWorkflow>()
  .name('Добро пожаловать')
  .workflowId(slugify('Добро пожаловать'))
  .description('Приветственные уведомления')
  .payloadSchema(zodSchema)
  .tags(['user'])
  .addSteps([
    createEmailStep('step-id', 'Тема', 'Тело письма'),
    createInAppStep('step-id', 'Заголовок', 'Контент'),
    createPushStep('step-id', 'Заголовок', 'Тело'),
  ])
  .build()
```

### Zod-схемы

Каждый workflow определяет Zod-схему для payload. Схема автоматически конвертируется в JSON Schema для Novu API через `zod-to-json-schema`.

### Синхронизация с Novu

- `pnpm run sync` — однократная синхронизация всех workflow
- `pnpm run sync:dev` — режим разработки с watch
- Требует переменных `NOVU_API_KEY` и `NOVU_API_URL`

### Slugify

Названия workflow на русском языке транслитерируются в латинские slug ID через `utils/slugify/`. Это обеспечивает стабильные `workflowId` для Novu API.

## Скрипты package.json

| Скрипт | Описание |
|--------|----------|
| `build` | Сборка через unbuild |
| `dev` | Сборка с watch |
| `test` | Vitest |
| `sync` | Синхронизация workflow с Novu (production) |
| `sync:dev` | Синхронизация с watch (development) |

## Зависимости

Нет workspace-зависимостей. Используется контроллером (`controller`) для триггера уведомлений.
