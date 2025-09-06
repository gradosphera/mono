# Система синхронизации блокчейн-данных Capital

Данная система обеспечивает автоматическую синхронизацию данных между блокчейном EOSIO и локальной базой данных PostgreSQL для расширения Capital.

## Архитектура

### Основные компоненты

1. **BlockchainDeltaTrackerService** - отслеживает дельты от capital контракта и эмитирует специфичные события
2. **AbstractEntitySyncService** - базовый класс для синхронизации сущностей
3. **ProjectSyncService** - конкретная реализация синхронизации проектов
4. **CapitalSyncInteractor** - координирует синхронизацию всех сущностей

### Принципы работы

1. **Отслеживание блоков**: Каждая сущность хранит номер блока последнего обновления (`block_num`)
2. **Дельта-синхронизация**: При получении дельты из блокчейна происходит обновление соответствующей сущности
3. **Обработка форков**: При форке удаляются все данные после указанного блока
4. **Создание при отсутствии**: Если сущности нет в базе, она создается из блокчейн-данных

## Поток данных

```
Блокчейн → BlockchainConsumerService → BlockchainDeltaTrackerService → ProjectSyncService → База данных
```

### События

- `delta::capital::*` - все дельты capital контракта
- `capital::delta::projects` - дельты таблицы projects
- `capital::fork` - события форка для capital

## Использование

### Добавление новой сущности для синхронизации

1. **Создайте доменную сущность** с реализацией `IBlockchainSynchronizable`:
```typescript
export class NewEntityDomain implements IBlockchainSynchronizable {
  getBlockchainId(): string { return this.id.toString(); }
  getBlockNum(): number | null { return this.block_num; }
  updateFromBlockchain(data: any, blockNum: number): void { /* логика обновления */ }
}
```

2. **Обновите TypeORM сущность** добавив поле `block_num`:
```typescript
@Column({ type: 'integer', nullable: true })
blockNum?: number;
```

3. **Создайте маппер дельт**:
```typescript
@Injectable()
export class NewEntityDeltaMapper implements IBlockchainDeltaMapper<INewEntityBlockchainData> {
  // реализация методов
}
```

4. **Создайте сервис синхронизации**:
```typescript
@Injectable()
export class NewEntitySyncService extends AbstractEntitySyncService<NewEntityDomain> {
  @OnEvent('capital::delta::new_table')
  async handleDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }
}
```

5. **Зарегистрируйте в модуле**:
```typescript
providers: [
  // ...
  NewEntityDeltaMapper,
  NewEntitySyncService,
]
```

### Обработка форков

Форки обрабатываются автоматически через события `capital::fork`. Все синхронизируемые сущности удаляют данные после указанного блока и ждут новых дельт для пересинхронизации.

### Мониторинг

Используйте `CapitalSyncInteractor` для получения статистики:

```typescript
const stats = await capitalSyncInteractor.getSyncStatistics();
const health = await capitalSyncInteractor.checkSyncHealth();
```

## Важные детали

### Документы в блокчейне

В блокчейне Capital контракта некоторые поля содержат подписанные документы. Эти документы должны быть правильно распарсены при получении дельт:

**Поля документов:**
- `statement` - выписка/заявление (в results, expenses, debts, invests)
- `approved_statement` - одобренное заявление (в expenses, debts)
- `authorization` - авторизация (в results, expenses, debts)
- `act` - акт (в results)
- `contract` - контракт (в contributors)

**Парсинг документов:**
```typescript
// В дельта-маппере для каждой сущности
if (value.statement) {
  value.statement = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.statement);
}
if (value.authorization) {
  value.authorization = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.authorization);
}
// ... остальные документы
```

**Типы в TypeORM сущностях:**
```typescript
@Column({ type: 'json' })
statement!: ISignedDocumentDomainInterface;

@Column({ type: 'json' })
approved_statement!: ISignedDocumentDomainInterface;
```

### Номера блоков

- `block_num = null` - сущность создана до синхронизации с блокчейном
- `block_num > 0` - номер блока последнего обновления из блокчейна

### Обработка устаревших обновлений

Система автоматически игнорирует обновления из старых блоков, предотвращая откат данных при получении дельт не в порядке.

### Производительность

- Дельты обрабатываются асинхронно
- Форки обрабатываются в фоне
- Статистика кешируется для быстрого доступа

## Расширение системы

Для добавления новых контрактов создайте аналогичную структуру:
1. Свой `DeltaTrackerService` для контракта
2. Маппер дельт для каждой таблицы
3. Сервис синхронизации для каждой сущности
4. Интерактор для координации

Система спроектирована для масштабирования и легкого добавления новых сущностей.
