# Механизм отправки уведомлений

## Обзор архитектуры

Система уведомлений построена на базе **NOVU** - платформы для управления уведомлениями, интегрированной с контроллером через типизированные воркфлоу.

## Компоненты системы

### 1. Пакет @coopenomics/notifications (workflows/)
Содержит определения всех воркфлоу уведомлений:

- **Структура воркфлоу**: Каждый воркфлоу экспортирует `id`, `payloadSchema` (Zod) и шаги (email, push, in_app)
- **Неймспейсы**: `Workflows.ApprovalRequest`, `Workflows.NewTransfer` и т.д.
- **Типизация**: Каждый воркфлоу имеет строго типизированный интерфейс payload
- **Синхронизация**: Воркфлоу автоматически синхронизируются с NOVU API через sync сервис

### 2. NOVU инфраструктура в контроллере

#### Порты и интерфейсы (domain/notification/)
- `NovuWorkflowPort` - основной порт для работы с воркфлоу
- `WorkflowTriggerDomainInterface` - структура данных для запуска уведомления
- Типизированные интерфейсы для получателей, акторов и результатов

#### Адаптеры (infrastructure/novu/)
- `NovuWorkflowAdapter` - HTTP клиент для NOVU API
- Отправляет триггеры через `/v1/events/trigger`
- Поддерживает как одиночные, так и пакетные отправки

### 3. Сервисы уведомлений (application/)

#### NotificationSenderService
Центральный сервис отправки уведомлений:
- `sendNotificationToUser()` - отправка конкретному пользователю
- `sendNotificationToUsers()` - множественная отправка
- `sendNotificationToAll()` - broadcast всем пользователям
- Использует subscriber_id из аккаунтов пользователей

## Способы запуска уведомлений

### 1. Подписка на дельты блокчейна
```typescript
@OnEvent(`delta::${SovietContract.contractName.production}::${SovietContract.Tables.Approvals.tableName}`)
async handleApprovalDelta(delta: IDelta)
```
- Срабатывает при изменениях в таблицах блокчейна
- Пример: `ApprovalNotificationService` следит за новыми запросами на одобрение

### 2. Подписка на действия блокчейна
```typescript
@OnEvent(`action::${SovietContract.contractName.production}::${SovietContract.Actions.Decisions.CreateAgenda.actionName}`)
async handleCreateAgenda(actionData: ActionDomainInterface)
```
- Срабатывает при выполнении контрактов
- Пример: `AgendaNotificationService` реагирует на добавление вопросов в повестку

### 3. Вызов из мутаций/API
```typescript
await this.notificationSenderService.sendNotificationToUser(
  username,
  Workflows.Welcome.id,
  { userName: 'Иван' }
);
```
- Прямой вызов из бизнес-логики
- Пример: приветственные уведомления при регистрации

## Процесс отправки уведомления

### 1. Подготовка данных
- Обогащение данными из блокчейна/базы (имена пользователей, кооперативы)
- Формирование типизированного payload согласно схеме воркфлоу
- Получение subscriber_id получателя

### 2. Создание триггера
```typescript
const triggerData: WorkflowTriggerDomainInterface = {
  name: Workflows.ApprovalRequest.id,
  to: {
    subscriberId: chairman.username,
    email: chairmanEmail,
  },
  payload: {
    chairmanName,
    requestTitle,
    authorName,
    // ... другие поля
  }
};
```

### 3. Отправка через NOVU API
- Адаптер отправляет HTTP POST на NOVU
- Возвращает transactionId для отслеживания
- NOVU обрабатывает шаги воркфлоу (email, push, in_app)

## Типичные паттерны использования

### Уведомление председателю
```typescript
// Получить председателя
const chairmen = await this.accountPort.getAccounts({ role: 'chairman' });

// Сформировать payload
const payload: Workflows.ApprovalRequest.IPayload = { /* ... */ };

// Отправить
await this.novuWorkflowAdapter.triggerWorkflow({
  name: Workflows.ApprovalRequest.id,
  to: { subscriberId: chairman.username, email: chairmanEmail },
  payload
});
```

### Множественная отправка членам совета
```typescript
// Получить всех членов совета
const members = await this.accountPort.getAccounts({ role: 'member' });

// Подготовить события для каждого
const events = members.map(member => ({
  to: { subscriberId: member.username, email: member.email },
  payload: agendaPayload
}));

// Пакетная отправка
await this.novuWorkflowAdapter.triggerBulkWorkflow({
  name: 'noviy-vopros-na-povestke',
  events
});
```

### Реакция на перевод токенов
```typescript
@OnEvent(`action::${TokenContract.contractName.production}::${TokenContract.Actions.Transfer.actionName}`)
async handleTransferNotification(action: IAction) {
  // Извлечь данные перевода
  const transferData = action.data as TokenContract.Actions.Transfer.ITransfer;

  // Отправить через NotificationSenderService
  await this.notificationSenderService.sendNotificationToUser(
    transferData.to,
    Workflows.NewTransfer.id,
    { quantity: transferData.quantity }
  );
}
```

## Особенности реализации

- **Типизация**: Строгая типизация payload через Zod схемы
- **Subscriber ID**: Используется username как subscriber_id в NOVU
- **Обогащение данных**: Перед отправкой данные обогащаются именами, названиями кооперативов
- **Обработка ошибок**: Логирование без прерывания основного потока
- **Фильтрация**: Проверка принадлежности к кооперативу (coopname)
- **Каналы**: Поддержка email, push, in_app уведомлений
