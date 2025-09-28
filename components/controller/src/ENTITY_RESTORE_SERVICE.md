# Система Восстановления Сущностей

## Архитектура

### Компоненты
- **entity_versions таблица** - PostgreSQL таблица для хранения версий всех сущностей
- **EntityVersioningService** - сервис управления версиями
- **BaseBlockchainRepository** - базовый репозиторий с автоматическим версионированием
- **AbstractEntitySyncService** - обработка форков с восстановлением

### Структура таблицы entity_versions
```sql
CREATE TABLE entity_versions (
  id UUID PRIMARY KEY,
  entity_table VARCHAR(100),     -- имя таблицы ('chairman_approvals')
  entity_id VARCHAR(36),         -- ID сущности (_id)
  previous_data JSONB,           -- полные данные предыдущей версии
  block_num INTEGER NULL,        -- номер блока (NULL для локальных изменений)
  change_type VARCHAR(50),       -- тип изменения ('blockchain_sync', 'save', 'update')
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Принципы Работы

### Версионирование
При любом изменении сущности автоматически сохраняется предыдущая версия:

```typescript
// В BaseBlockchainRepository.update()
await this.entityVersioningService.saveVersionBeforeUpdate(
  this.repository,           // Repository<TEntity>
  this.getEntityTableName(), // имя таблицы
  typeormEntity,             // текущие данные
  blockNum || null,          // номер блока
  'update'                   // тип изменения
);
```

### Восстановление при Форке
При получении форка происходит восстановление:

```typescript
// AbstractEntitySyncService.handleFork()
await this.repository.deleteByBlockNumGreaterThan(forkBlockNum);
if (this.repository.restoreFromVersions) {
  await this.repository.restoreFromVersions(forkBlockNum);
}
```

### Алгоритм Восстановления
1. Выбираются версии с `block_num <= forkBlockNum OR block_num IS NULL`
2. Группируются по `entity_id`, выбирается самая актуальная версия для каждой сущности
3. Локальные изменения (`block_num = NULL`) имеют приоритет над блокчейн изменениями
4. Сущности обновляются или создаются заново из сохраненных данных

## Интеграция в Репозитории

### Наследование
```typescript
export class ApprovalTypeormRepository
  extends BaseBlockchainRepository<ApprovalDomainEntity, ApprovalTypeormEntity>
  implements ApprovalRepository {

  constructor(
    repository: Repository<ApprovalTypeormEntity>,
    entityVersioningService: EntityVersioningService  // ОБЯЗАТЕЛЬНО
  ) {
    super(repository, entityVersioningService);
  }
}
```

### Определение Имени Таблицы
```typescript
// В каждой TypeORM сущности - статический метод (как getSyncKey в доменных сущностях)
export const EntityName = 'chairman_approvals';

@Entity(EntityName)
export class ApprovalTypeormEntity extends BaseTypeormEntity {
  static getTableName(): string {
    return EntityName;  // ОБЯЗАТЕЛЬНО реализовать!
  }

  // ... поля сущности
}
```

Автоматическое определение в репозитории:
```typescript
// BaseBlockchainRepository автоматически использует статический метод сущности
protected getEntityTableName(): string {
  const entityClass = this.repository.target as any;
  return entityClass.getTableName();  // Вызывает статический метод сущности
}
```

## Типы Изменений

### Blockchain Sync
```typescript
// При синхронизации с блокчейном
blockNum = 100500  // конкретный номер блока
changeType = 'blockchain_sync'
```

### Локальные Изменения
```typescript
// При confirmApprove/declineApprove
blockNum = null    // локальное изменение
changeType = 'save'
```

## Обработка Форков

### Удаление Устаревших Данных
```typescript
// Удаляются только блокчейн изменения после форка
DELETE FROM entity_versions
WHERE block_num > forkBlockNum AND block_num IS NOT NULL
```

### Восстановление Состояния
```typescript
// Группировка версий по entity_id
const latestVersions = versions.reduce((acc, version) => {
  const existing = acc.get(version.entity_id);
  if (!existing || shouldReplaceVersion(existing, version)) {
    acc.set(version.entity_id, version);
  }
  return acc;
}, new Map());
```

### Приоритеты Версий
1. Локальные изменения (block_num = NULL) приоритетнее всего
2. Среди локальных - самая свежая по created_at
3. Среди блокчейн изменений - с максимальным block_num

## Производительность

### Overhead
- Одна дополнительная запись в entity_versions на каждое изменение
- Запросы восстановления: O(n) где n - количество измененных сущностей

### Оптимизации
- Индексы по (entity_table, entity_id, block_num)
- Партиционирование по entity_table при необходимости
- Очистка старых версий после успешного восстановления

## Отладка

### Проверка Версий
```sql
-- Версии для конкретной сущности
SELECT * FROM entity_versions
WHERE entity_table = 'chairman_approvals'
  AND entity_id = 'some-uuid'
ORDER BY block_num DESC, created_at DESC;
```

### Мониторинг
```typescript
// Количество версий по таблицам
SELECT entity_table, COUNT(*) FROM entity_versions GROUP BY entity_table;
```

## Расширение

### Новая Сущность
```typescript
// 1. Определить имя таблицы
export const EntityName = 'new_entities';

// 2. Создать TypeORM сущность
@Entity(EntityName)
export class NewTypeormEntity extends BaseTypeormEntity {}

// 3. Создать репозиторий
export class NewRepository extends BaseBlockchainRepository<NewEntity, NewTypeormEntity> {
  constructor(repository: Repository<NewTypeormEntity>, versioning: EntityVersioningService) {
    super(repository, versioning);
  }
}
```

### Кастомная Логика
```typescript
// Переопределить shouldReplaceVersion если нужна специальная логика
export class CustomRepository extends BaseBlockchainRepository<...> {
  protected async restoreFromVersions(forkBlockNum: number): Promise<void> {
    // Кастомная логика восстановления
    await super.restoreFromVersions(forkBlockNum);
    // Дополнительные действия
  }
}
```
