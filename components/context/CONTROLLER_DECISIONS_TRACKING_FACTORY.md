# Фабрика отслеживания решений (Decision Tracking Factory)

## Назначение

Фабрика отслеживания решений — это переиспользуемый сервис для автоматического обновления системных переменных (vars) при принятии решений советом или общим собранием пайщиков.

## Архитектура

Система построена согласно чистой архитектуре:

```
domain/decision-tracking/          # Домен
├── interfaces/                    # Интерфейсы
│   └── tracking-rule-domain.interface.ts
├── ports/                         # Порты
│   └── decision-tracking.port.ts
├── events/                        # События
│   └── decision-tracked.event.ts
└── index.ts

infrastructure/decision-tracking/  # Инфраструктура
├── adapters/                      # Адаптеры
│   └── decision-tracking.adapter.ts
├── repositories/                  # Репозитории
│   └── tracking-rule.repository.ts
└── decision-tracking-infrastructure.module.ts
```

## Принцип работы

### 1. Регистрация правила отслеживания

Расширение регистрирует правило отслеживания при создании решения:

```typescript
await decisionTrackingPort.registerTrackingRule({
  hash: documentHash,
  event_type: DecisionEventType.SOVIET_DECISION, // или MEET_DECISION
  vars_field: 'wallet_agreement',
  metadata: {
    onboarding_step: 'wallet_agreement',
    custom_data: '...'
  },
  expires_at: new Date('2025-02-15')
});
```

### 2. Автоматическое отслеживание

Фабрика автоматически подписывается на события блокчейна:
- `action::soviet::newresolved` - решения совета
- `action::meet::newresolved` - решения общих собраний
- `action::meet::restartmeet` - перезапуск общих собраний

### 3. Обработка совпадений

При получении события с подходящим hash фабрика:
1. Находит соответствующее правило отслеживания
2. Обновляет поле в vars (если указаны decision_id и decision_date)
3. Деактивирует правило
4. Эмитит событие `decision.tracked`

### 4. Пост-обработка через события

Расширения могут подписаться на событие `decision.tracked` для дополнительной обработки:

```typescript
@OnEvent(DecisionTrackedEvent.eventName)
async handleDecisionTracked(event: DecisionTrackedEvent): Promise<void> {
  const { result } = event;

  // Выполнить дополнительные действия
  if (result.metadata?.onboarding_step) {
    await this.updateOnboardingProgress(result.metadata.onboarding_step);
  }
}
```

## Использование

### В расширениях

1. Импортировать модуль инфраструктуры:

```typescript
@Module({
  imports: [
    DecisionTrackingInfrastructureModule,
    // ...
  ],
})
export class MyExtensionModule {}
```

2. Инжектировать порт:

```typescript
constructor(
  @Inject(DECISION_TRACKING_PORT)
  private readonly decisionTrackingPort: DecisionTrackingPort
) {}
```

3. Регистрировать правила при создании решений:

```typescript
await this.decisionTrackingPort.registerTrackingRule({
  hash: documentHash,
  event_type: DecisionEventType.SOVIET_DECISION,
  vars_field: 'my_agreement',
  metadata: { /* custom data */ }
});
```

4. Подписаться на события отслеживания (опционально):

```typescript
@OnEvent(DecisionTrackedEvent.eventName)
async handleTracked(event: DecisionTrackedEvent) {
  // Пост-обработка
}
```

## API

### DecisionTrackingPort

#### registerTrackingRule(input)
Регистрирует новое правило отслеживания.

**Параметры:**
- `hash` - Hash документа для отслеживания
- `event_type` - Тип события (SOVIET_DECISION или MEET_DECISION)
- `vars_field` - Ключ в vars для обновления
- `metadata` - Метаданные для пост-обработки
- `expires_at` - Дата истечения правила (опционально)

**Возвращает:** `TrackingRuleDomainInterface`

#### updateTrackingRuleHash(oldHash, newHash)
Обновляет hash в существующем правиле (используется при перезапуске общих собраний).

#### getActiveRules()
Получает все активные правила отслеживания.

#### getRuleByHash(hash)
Получает правило по hash документа.

#### deactivateRule(id)
Деактивирует правило отслеживания.

#### deleteRule(id)
Удаляет правило отслеживания.


## События

### DecisionTrackedEvent

Эмитится при успешном отслеживании и обработке решения.

**Данные события:**
```typescript
{
  matched: true,
  rule_id: 'uuid',
  hash: 'document_hash',
  event_type: DecisionEventType.SOVIET_DECISION,
  vars_field: 'wallet_agreement',
  decision_id: '123',
  decision_date: '2025-01-17T12:00:00Z',
  metadata: { /* custom data */ }
}
```

## Особенности

### Общие собрания
Для общих собраний поддерживается автоматическое обновление hash при перезапуске через событие `restartmeet`.

### Управление правилами
Расширения сами управляют своими правилами отслеживания. Если нужно отключить отслеживание, расширение должно вызвать `deactivateRule()` или `deleteRule()`. Фабрика не имеет встроенной логики истечения правил.

### TypeORM хранилище
Используется TypeORM репозиторий с PostgreSQL для персистентного хранения правил отслеживания. Правила сохраняются в таблице `tracking_rules`.

## Пример: Онбординг председателя

```typescript
// Регистрация отслеживания решения
const document = await this.generateDecisionDocument(...);

await this.decisionTrackingPort.registerTrackingRule({
  hash: document.hash,
  event_type: DecisionEventType.SOVIET_DECISION,
  vars_field: 'wallet_agreement',
  metadata: {
    onboarding_step: 'wallet_agreement',
  },
  expires_at: onboardingExpireDate,
});

// Подписка на событие для обновления статуса онбординга
@OnEvent(DecisionTrackedEvent.eventName)
async handleDecisionTracked(event: DecisionTrackedEvent) {
  if (event.result.metadata?.onboarding_step) {
    await this.markOnboardingStepComplete(
      event.result.metadata.onboarding_step
    );
  }
}
```

## Миграции базы данных

При первом запуске будет автоматически создана таблица `tracking_rules`:

```sql
CREATE TABLE tracking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash VARCHAR(64) NOT NULL UNIQUE,
  event_type VARCHAR(20) NOT NULL,
  vars_field VARCHAR(50) NOT NULL,
  metadata JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_tracking_rules_hash ON tracking_rules(hash);
```

## Преимущества

1. **Переиспользуемость** - Единая логика отслеживания для всех расширений
2. **Разделение ответственности** - Фабрика отвечает только за отслеживание и обновление vars
3. **Расширяемость** - Пост-обработка через события не нарушает DI
4. **Автоматизация** - Отслеживание происходит автоматически без ручного вмешательства
5. **Чистая архитектура** - Соблюдение принципов разделения на домен и инфраструктуру
