# Система синхронизации блокчейн-данных Capital

Данная система обеспечивает автоматическую синхронизацию данных между блокчейном EOSIO и локальной базой данных PostgreSQL для расширения Capital.

## Архитектура

### Основные компоненты

1. **AbstractEntitySyncService** - базовый класс для синхронизации сущностей
2. **ProjectSyncService** - конкретная реализация синхронизации проектов
3. **SegmentSyncService** - синхронизация сегментов участников
4. **CapitalSyncInteractor** - координирует синхронизацию всех сущностей

### Принципы работы

1. **Отслеживание блоков**: Каждая сущность хранит номер блока последнего обновления (`block_num`)
2. **Дельта-синхронизация**: При получении дельты из блокчейна происходит обновление соответствующей сущности
3. **Обработка форков**: При форке удаляются все данные после указанного блока
4. **Создание при отсутствии**: Если сущности нет в базе, она создается из блокчейн-данных

## Поток данных

```
Блокчейн → BlockchainConsumerService → [ProjectSyncService|SegmentSyncService|...] → База данных
```

### События

- `delta::capital::*` - все дельты capital контракта (от BlockchainConsumerService)
- `fork::*` - события форка для всех контрактов (от BlockchainConsumerService)

## Использование

### Добавление новой сущности для синхронизации

1. **Создайте доменную сущность** с реализацией `IBlockchainSynchronizable`:
```typescript
export class NewEntityDomain implements IBlockchainSynchronizable {
  // Статические ключи для синхронизации
  private static primary_key = 'id'; // Ключ для поиска в блокчейне
  private static sync_key = 'custom_field'; // Ключ для синхронизации с БД

  getPrimaryKey(): string { return this.id.toString(); }
  getSyncKey(): string { return this.custom_field; }
  getBlockNum(): number | null { return this.block_num; }
  updateFromBlockchain(data: any, blockNum: number): void { /* логика обновления */ }

  static getSyncKey(): string { return NewEntityDomain.sync_key; }
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
  extractSyncValue(delta: IDelta): string {
    // Извлекаем значение из дельты для синхронизации
    return delta.primary_key.toString();
  }

  extractSyncKey(): string {
    // Возвращаем ключ синхронизации из доменной сущности
    return NewEntityDomain.getSyncKey();
  }

  // остальные методы
}
```

4. **Создайте сервис синхронизации**:
```typescript
@Injectable()
export class NewEntitySyncService
  extends AbstractEntitySyncService<NewEntityDomain, INewEntityBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'NewEntity';

  constructor(
    @Inject(NEW_ENTITY_REPOSITORY)
    newEntityRepository: NewEntityRepository,
    newEntityDeltaMapper: NewEntityDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(newEntityRepository, newEntityDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.debug(
      `Сервис синхронизации новой сущности инициализирован. Поддерживаемые контракты: [${supportedVersions.contracts.join(
        ', '
      )}], таблицы: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.debug(`Подписка на ${allPatterns.length} паттернов событий: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.processDelta.bind(this));
    });

    this.logger.debug('Сервис синхронизации новой сущности полностью инициализирован с подписками на паттерны');
  }

  /**
   * Обработка форков для новой сущности
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleNewEntityFork(forkData: { block_num: number }): Promise<void> {
    await this.handleFork(forkData.block_num);
  }
}
```

5. **Добавьте компоненты в CapitalContractInfoService**:
```typescript
// В capital-contract-info.service.ts добавьте паттерн для новой таблицы
private readonly tablePatterns: Record<string, string[]> = {
  // ...
  newentities: ['newentities', 'newentities*'], // Для сущностей ≤ 12 символов
  // или для сущностей = 12 символов:
  // newentities12: ['newentities12', 'newentities1*'],
};
```

6. **Зарегистрируйте компоненты в модулях**:

**В capital-database.module.ts**:
```typescript
import { NewEntityTypeormEntity } from '../entities/new-entity.typeorm-entity';

// Добавьте в entities массив:
entities: [
  // ...
  NewEntityTypeormEntity,
  EntityVersionTypeormEntity,
],

// Добавьте в TypeOrmModule.forFeature:
TypeOrmModule.forFeature([
  // ...
  NewEntityTypeormEntity,
  EntityVersionTypeormEntity,
], CAPITAL_DATABASE_CONNECTION)
```

**В capital-extension.module.ts**:
```typescript
import { NewEntityTypeormRepository } from './infrastructure/repositories/new-entity.typeorm-repository';
import { NewEntityDeltaMapper } from './infrastructure/blockchain/mappers/new-entity-delta.mapper';
import { NewEntitySyncService } from './infrastructure/blockchain/services/new-entity-sync.service';
import { NEW_ENTITY_REPOSITORY } from './domain/repositories/new-entity.repository';

// Добавьте в providers:
providers: [
  // ...
  // Repositories
  {
    provide: NEW_ENTITY_REPOSITORY,
    useClass: NewEntityTypeormRepository,
  },

  // Blockchain Sync Services
  NewEntityDeltaMapper,
  NewEntitySyncService,

  // ... остальные провайдеры
],
```

### Обработка форков

Форки обрабатываются автоматически через события `fork::*` (независимо от контракта). Все синхронизируемые сущности удаляют данные после указанного блока и ждут новых дельт для пересинхронизации.

Каждый сервис синхронизации должен иметь обработчик:
```typescript
@OnEvent('fork::*')
async handleEntityFork(forkData: { block_num: number }): Promise<void> {
  await this.handleFork(forkData.block_num);
}
```

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

**Сегменты (segments):**
Таблица `segments` содержит информацию о вкладах участников в проекты капитализации. Особенности:
- Составной ключ синхронизации: `project_hash + username`
- Содержит роли участника (author, creator, coordinator, etc.)
- Финансовые данные: инвестиции, бонусы, премии
- CRPS поля для распределения наград
- Статусы: generation, ready, contributed, accepted, completed

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

### Кастомные ключи синхронизации

Система поддерживает гибкую настройку ключей для синхронизации:

**Primary Key** - ключ для поиска сущности в блокчейне:
- Определяется в доменной сущности как `primary_key`
- Обычно это поле `id` из таблицы блокчейна

**Sync Key** - ключ для синхронизации между блокчейном и БД:
- Определяется в доменной сущности как `sync_key`
- Может быть любое уникальное поле (например, `project_hash`)
- Используется для поиска существующих записей в БД при синхронизации

Пример для проектов:
```typescript
export class ProjectDomainEntity {
  private static primary_key = 'id';        // Поиск в блокчейне по id
  private static sync_key = 'project_hash'; // Синхронизация по project_hash
}
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
