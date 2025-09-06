# Руководство по добавлению новой сущности синхронизации

## Обзор процесса

Это руководство описывает полный процесс добавления новой сущности для синхронизации с блокчейном. **Всегда следуйте этому порядку создания файлов и проверяйте типы после каждого шага.**

### 📋 Шаблон на примере сущности "Expense" (Расход)

Пример демонстрирует добавление сущности **расход** (`expense`) для синхронизации с таблицей `expenses` контракта Capital.

---

## 🚀 Шаг 1: Доменный уровень (Domain Layer)

### 1.1 Создание доменной сущности

**Файл:** `domain/entities/expense.entity.ts`

```typescript
import { ExpenseStatus } from '../enums/expense-status.enum';
import type { IExpenseDatabaseData } from '../interfaces/expense-database.interface';
import type { IExpenseBlockchainData } from '../interfaces/expense-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность расхода
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные расхода из таблицы expenses
 */
export class ExpenseDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ExpenseStatus;

  // Поля из блокчейна (expenses.hpp)
  public coopname: IExpenseBlockchainData['coopname'];
  public username: IExpenseBlockchainData['username'];
  public project_hash: IExpenseBlockchainData['project_hash'];
  public expense_hash: IExpenseBlockchainData['expense_hash'];
  public fund_id: IExpenseBlockchainData['fund_id'];
  public blockchainStatus: IExpenseBlockchainData['status']; // Статус из блокчейна
  public amount: IExpenseBlockchainData['amount'];
  public description: IExpenseBlockchainData['description'];
  public expense_statement: ISignedDocumentDomainInterface;
  public approved_statement: ISignedDocumentDomainInterface;
  public authorization: ISignedDocumentDomainInterface;
  public spended_at: IExpenseBlockchainData['spended_at'];

  constructor(databaseData: IExpenseDatabaseData, blockchainData: IExpenseBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.project_hash = blockchainData.project_hash;
    this.expense_hash = blockchainData.expense_hash;
    this.fund_id = blockchainData.fund_id;
    this.blockchainStatus = blockchainData.status;
    this.amount = blockchainData.amount;
    this.description = blockchainData.description;
    this.expense_statement = blockchainData.expense_statement;
    this.approved_statement = blockchainData.approved_statement;
    this.authorization = blockchainData.authorization;
    this.spended_at = blockchainData.spended_at;

    // Синхронизация статуса с блокчейн данными
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
  }

  // Реализация IBlockchainSynchronizable
  getBlockchainId(): string {
    return this.blockchain_id;
  }

  getBlockNum(): number | null {
    return this.block_num;
  }

  updateFromBlockchain(blockchainData: IExpenseBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.project_hash = blockchainData.project_hash;
    this.expense_hash = blockchainData.expense_hash;
    this.fund_id = blockchainData.fund_id;
    this.blockchainStatus = blockchainData.status;
    this.amount = blockchainData.amount;
    this.description = blockchainData.description;
    this.expense_statement = blockchainData.expense_statement;
    this.approved_statement = blockchainData.approved_statement;
    this.authorization = blockchainData.authorization;
    this.spended_at = blockchainData.spended_at;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  private mapBlockchainStatusToDomain(blockchainStatus: IExpenseBlockchainData['status']): ExpenseStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'pending': return ExpenseStatus.PENDING;
      case 'approved': return ExpenseStatus.APPROVED;
      case 'paid': return ExpenseStatus.PAID;
      case 'declined': return ExpenseStatus.DECLINED;
      case 'cancelled': return ExpenseStatus.CANCELLED;
      default:
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CANCELLED`);
        return ExpenseStatus.CANCELLED;
    }
  }
}
```

**Что проверять:**
- ✅ Импорт `IBlockchainSynchronizable`
- ✅ Правильные типы документов `ISignedDocumentDomainInterface`
- ✅ Реализация всех методов интерфейса
- ✅ Корректное маппинг статусов

### 1.2 Создание перечисления статусов

**Файл:** `domain/enums/expense-status.enum.ts`

```typescript
/**
 * Перечисление статусов расходов
 * Синхронизировано с константами из expenses.hpp блокчейн контракта
 */
export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
}
```

### 1.3 Создание интерфейсов базы данных

**Файл:** `domain/interfaces/expense-database.interface.ts`

```typescript
import type { IBaseDatabaseData } from './base-database.interface';

/**
 * Интерфейс данных расхода из базы данных
 */
export interface IExpenseDatabaseData extends IBaseDatabaseData {
  // Дополнительные поля базы данных, если нужны
}
```

**Файл:** `domain/interfaces/base-database.interface.ts` (уже существует)

```typescript
/**
 * Базовый интерфейс данных из базы данных для всех синхронизируемых сущностей
 */
export interface IBaseDatabaseData {
  id: string;
  blockchain_id: string;
  block_num: number | null;
  present: boolean;
}
```

### 1.4 Создание интерфейса данных блокчейна

**Файл:** `domain/interfaces/expense-blockchain.interface.ts`

```typescript
import type { CapitalContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Интерфейс данных расхода из блокчейна
 */
export type IExpenseBlockchainData = Omit<
  CapitalContract.Tables.Expenses.IExpense,
  'expense_statement' | 'approved_statement' | 'authorization'
> & {
  expense_statement: ISignedDocumentDomainInterface;
  approved_statement: ISignedDocumentDomainInterface;
  authorization: ISignedDocumentDomainInterface;
};
```

**Что проверять:**
- ✅ Импорт типов из `cooptypes`
- ✅ Правильные имена полей документов (должны совпадать с блокчейном)
- ✅ Использование `ISignedDocumentDomainInterface` для документов

### 1.5 Создание интерфейса репозитория

**Файл:** `domain/repositories/expense.repository.ts`

```typescript
import type { ExpenseDomainEntity } from '../entities/expense.entity';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';

export const EXPENSE_REPOSITORY = Symbol('EXPENSE_REPOSITORY');

/**
 * Интерфейс репозитория расходов
 */
export interface ExpenseRepository extends IBlockchainSyncRepository<ExpenseDomainEntity> {
  // Дополнительные методы репозитория расходов, если нужны
  // findByProjectHash(projectHash: string): Promise<ExpenseDomainEntity[]>;
  // findByUsername(username: string): Promise<ExpenseDomainEntity[]>;
}
```

---

## 🏗️ Шаг 2: Уровень инфраструктуры (Infrastructure Layer)

### 2.1 Создание TypeORM сущности

**Файл:** `infrastructure/entities/expense.typeorm-entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ExpenseStatus } from '../../domain/enums/expense-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_expenses';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['blockchain_id'])
@Index(`idx_${EntityName}_expense_hash`, ['expense_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_status`, ['status'])
export class ExpenseTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  blockchain_id?: string;

  @Column({ type: 'integer', nullable: true })
  block_num?: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (expenses.hpp)
  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 12 })
  username!: string;

  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({ type: 'varchar', length: 64 })
  expense_hash!: string;

  @Column({ type: 'varchar', length: 64 })
  fund_id!: string;

  @Column({ type: 'varchar', length: 20 })
  blockchain_status!: string;

  @Column({ type: 'bigint' })
  amount!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'json' })
  expense_statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  approved_statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  authorization!: ISignedDocumentDomainInterface;

  @Column({ type: 'timestamp' })
  spended_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status!: ExpenseStatus;
}
```

**Что проверять:**
- ✅ `@Column({ type: 'json' })` для всех полей документов
- ✅ Правильные индексы для поиска
- ✅ Типы полей совпадают с интерфейсами

### 2.2 Создание маппера домен ↔ TypeORM

**Файл:** `infrastructure/mappers/expense.mapper.ts`

```typescript
import { ExpenseDomainEntity } from '../../domain/entities/expense.entity';
import { ExpenseTypeormEntity } from '../entities/expense.typeorm-entity';
import type { IExpenseDatabaseData } from '../../domain/interfaces/expense-database.interface';
import type { IExpenseBlockchainData } from '../../domain/interfaces/expense-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью расхода и TypeORM сущностью
 */
export class ExpenseMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ExpenseTypeormEntity): ExpenseDomainEntity {
    const databaseData: IExpenseDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IExpenseBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      project_hash: entity.project_hash,
      expense_hash: entity.expense_hash,
      fund_id: entity.fund_id,
      status: entity.blockchain_status as any, // Приведение типа статуса
      amount: entity.amount,
      description: entity.description,
      expense_statement: entity.expense_statement,
      approved_statement: entity.approved_statement,
      authorization: entity.authorization,
      spended_at: entity.spended_at.toISOString(),
    };

    return new ExpenseDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ExpenseDomainEntity>): Partial<ExpenseTypeormEntity> {
    const entity: Partial<ExpenseTypeormEntity> = {
      blockchain_id: domain.blockchain_id || '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.expense_hash !== undefined) entity.expense_hash = domain.expense_hash;
    if (domain.fund_id !== undefined) entity.fund_id = domain.fund_id;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus.toString();
    if (domain.amount !== undefined) entity.amount = domain.amount;
    if (domain.description !== undefined) entity.description = domain.description;
    if (domain.expense_statement !== undefined) entity.expense_statement = domain.expense_statement;
    if (domain.approved_statement !== undefined) entity.approved_statement = domain.approved_statement;
    if (domain.authorization !== undefined) entity.authorization = domain.authorization;
    if (domain.spended_at !== undefined) entity.spended_at = new Date(domain.spended_at);

    return entity;
  }
}
```

### 2.3 Создание дельта-маппера

**Файл:** `infrastructure/blockchain/mappers/expense-delta.mapper.ts`

```typescript
import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ExpenseDomainEntity } from '../../../domain/entities/expense.entity';
import type { IExpenseBlockchainData } from '../../../domain/interfaces/expense-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные расхода
 */
@Injectable()
export class ExpenseDeltaMapper implements IBlockchainDeltaMapper<IExpenseBlockchainData, ExpenseDomainEntity> {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly contractInfo: CapitalContractInfoService
  ) {
    this.logger.setContext(ExpenseDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IExpenseBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.Expenses.IExpense;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // 🔥 ВАЖНО: Парсим документы ПЕРЕД возвратом
      const expense_statement = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.expense_statement);
      const approved_statement = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.approved_statement);
      const authorization = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.authorization);

      // Парсим документы
      return { ...value, expense_statement, approved_statement, authorization };
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractEntityId(delta: IDelta): string {
    // В таблице expenses primary_key является ID расхода
    return delta.primary_key.toString();
  }

  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable = delta.table === 'expenses' || delta.table === 'expenses*' || delta.table.includes('expenses');

    return isRelevantContract && isRelevantTable;
  }

  private validateBlockchainData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Проверяем обязательные поля
    const requiredFields = [
      'id',
      'coopname',
      'username',
      'project_hash',
      'expense_hash',
      'fund_id',
      'status',
      'amount',
      'description',
      'expense_statement',
      'approved_statement',
      'authorization',
      'spended_at',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        this.logger.warn(`Missing required field '${field}' in blockchain data`);
        return false;
      }
    }

    return true;
  }

  getSupportedTableNames(): string[] {
    return ['expenses', 'expenses*'];
  }

  getSupportedContractNames(): string[] {
    return this.contractInfo.getSupportedContractNames();
  }

  getAllEventPatterns(): string[] {
    const patterns: string[] = [];
    const supportedContracts = this.contractInfo.getSupportedContractNames();
    const supportedTables = this.getSupportedTableNames();

    for (const contractName of supportedContracts) {
      for (const tableName of supportedTables) {
        patterns.push(`delta::${contractName}::${tableName}`);
      }
    }

    return patterns;
  }
}
```

**🔥 КЛЮЧЕВЫЕ МОМЕНТЫ В ДЕЛЬТА-МАППЕРЕ:**
- ✅ `const value = delta.value as CapitalContract.Tables.Expenses.IExpense;` - приведение типа
- ✅ Парсинг документов через `DomainToBlockchainUtils.convertChainDocumentToDomainFormat`
- ✅ Валидация всех обязательных полей
- ✅ Правильные паттерны событий

### 2.4 Создание сервиса синхронизации

**Файл:** `infrastructure/blockchain/services/expense-sync.service.ts`

```typescript
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ExpenseDomainEntity } from '../../../domain/entities/expense.entity';
import { ExpenseRepository, EXPENSE_REPOSITORY } from '../../../domain/repositories/expense.repository';
import { ExpenseDeltaMapper } from '../mappers/expense-delta.mapper';
import type { IExpenseBlockchainData } from '../../../domain/interfaces/expense-blockchain.interface';

/**
 * Сервис синхронизации расходов с блокчейном
 *
 * Подписывается на дельты таблицы expenses контракта capital
 * и синхронизирует данные расходов в локальной базе данных
 */
@Injectable()
export class ExpenseSyncService
  extends AbstractEntitySyncService<ExpenseDomainEntity, IExpenseBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Expense';

  constructor(
    @Inject(EXPENSE_REPOSITORY)
    expenseRepository: ExpenseRepository,
    expenseDeltaMapper: ExpenseDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(expenseRepository, expenseDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Expense sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleExpenseDelta.bind(this));
    });
  }

  /**
   * Обработчик дельт расходов
   */
  @OnEvent('capital::delta::expenses')
  async handleExpenseDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }

  /**
   * Обработчик форков для расходов
   */
  @OnEvent('capital::fork')
  async handleFork(blockNum: number): Promise<void> {
    await this.processFork(blockNum);
  }

  /**
   * Получение поддерживаемых версий контрактов и таблиц
   */
  private getSupportedVersions(): { contracts: string[]; tables: string[] } {
    return {
      contracts: this.expenseDeltaMapper.getSupportedContractNames(),
      tables: this.expenseDeltaMapper.getSupportedTableNames(),
    };
  }

  /**
   * Получение всех паттернов событий для подписки
   */
  private getAllEventPatterns(): string[] {
    return this.expenseDeltaMapper.getAllEventPatterns();
  }
}
```

### 2.5 Создание TypeORM репозитория

**Файл:** `infrastructure/repositories/expense.typeorm-repository.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseDomainEntity } from '../../domain/entities/expense.entity';
import { ExpenseTypeormEntity } from '../entities/expense.typeorm-entity';
import { ExpenseMapper } from '../mappers/expense.mapper';
import type { ExpenseRepository } from '../../domain/repositories/expense.repository';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';

/**
 * TypeORM реализация репозитория расходов
 */
@Injectable()
export class ExpenseTypeormRepository implements ExpenseRepository {
  constructor(
    @InjectRepository(ExpenseTypeormEntity)
    private readonly expenseTypeormRepository: Repository<ExpenseTypeormEntity>
  ) {}

  async findByBlockchainId(blockchainId: string): Promise<ExpenseDomainEntity | null> {
    const entity = await this.expenseTypeormRepository.findOne({
      where: { blockchain_id: blockchainId },
    });

    return entity ? ExpenseMapper.toDomain(entity) : null;
  }

  async findByBlockNumGreaterThan(blockNum: number): Promise<ExpenseDomainEntity[]> {
    const entities = await this.expenseTypeormRepository
      .createQueryBuilder('expense')
      .where('expense.block_num > :blockNum', { blockNum })
      .getMany();

    return entities.map(ExpenseMapper.toDomain);
  }

  async createIfNotExists(blockchainData: any, blockNum: number): Promise<ExpenseDomainEntity> {
    const blockchainId = blockchainData.id.toString();

    let existingEntity = await this.findByBlockchainId(blockchainId);

    if (existingEntity) {
      // Обновляем существующую сущность
      existingEntity.updateFromBlockchain(blockchainData, blockNum);
      await this.save(existingEntity);
      return existingEntity;
    }

    // Создаем новую сущность
    const minimalDatabaseData = {
      id: '', // Будет сгенерирован TypeORM
      blockchain_id: blockchainId,
      block_num: blockNum,
      present: true,
    };

    const newEntity = new ExpenseDomainEntity(minimalDatabaseData, blockchainData);
    return await this.save(newEntity);
  }

  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.expenseTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('block_num > :blockNum', { blockNum })
      .execute();
  }

  async save(entity: ExpenseDomainEntity): Promise<ExpenseDomainEntity> {
    const typeormEntity = ExpenseMapper.toEntity(entity);
    const savedEntity = await this.expenseTypeormRepository.save(typeormEntity as ExpenseTypeormEntity);
    return ExpenseMapper.toDomain(savedEntity);
  }

  async findAll(): Promise<ExpenseDomainEntity[]> {
    const entities = await this.expenseTypeormRepository.find();
    return entities.map(ExpenseMapper.toDomain);
  }

  async findById(id: string): Promise<ExpenseDomainEntity | null> {
    const entity = await this.expenseTypeormRepository.findOne({
      where: { id },
    });

    return entity ? ExpenseMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.expenseTypeormRepository.delete(id);
  }
}
```

---

## 🔧 Шаг 3: Регистрация компонентов

### 3.1 Регистрация в модуле базы данных

**Файл:** `infrastructure/database/capital-database.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// ... другие импорты
import { ExpenseTypeormEntity } from '../entities/expense.typeorm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // ... другие сущности
      ExpenseTypeormEntity,
    ]),
  ],
})
export class CapitalDatabaseModule {}
```

### 3.2 Регистрация в основном модуле расширения

**Файл:** `capital-extension.module.ts`

```typescript
import { Module } from '@nestjs/common';
// ... другие импорты
import { ExpenseRepository, EXPENSE_REPOSITORY } from './domain/repositories/expense.repository';
import { ExpenseTypeormRepository } from './infrastructure/repositories/expense.typeorm-repository';
import { ExpenseDeltaMapper } from './infrastructure/blockchain/mappers/expense-delta.mapper';
import { ExpenseSyncService } from './infrastructure/blockchain/services/expense-sync.service';

@Module({
  imports: [
    // ... другие импорты
  ],
  providers: [
    // ... другие провайдеры

    // Expense компоненты
    {
      provide: EXPENSE_REPOSITORY,
      useClass: ExpenseTypeormRepository,
    },
    ExpenseTypeormRepository,
    ExpenseDeltaMapper,
    ExpenseSyncService,
  ],
  exports: [
    // ... другие экспорты
    ExpenseSyncService,
  ],
})
export class CapitalExtensionModule {}
```

---

## 📋 Шаг 4: Проверка и тестирование

### 4.1 Проверка типов TypeScript
```bash
# Проверить типы
npm run type-check

# Или в IDE посмотреть на ошибки
```

### 4.2 Проверка линтера
```bash
# Проверить линтер
npm run lint
```

### 4.3 Тестирование синхронизации
```typescript
// В коде приложения
const expenseSync = await capitalSyncInteractor.getExpenseSyncService();
const stats = await expenseSync.getSyncStatistics();
```

---

## 🔍 Список всех файлов для сущности "Expense"

### Доменный уровень:
- ✅ `domain/entities/expense.entity.ts`
- ✅ `domain/enums/expense-status.enum.ts`
- ✅ `domain/interfaces/expense-database.interface.ts`
- ✅ `domain/interfaces/expense-blockchain.interface.ts`
- ✅ `domain/repositories/expense.repository.ts`

### Уровень инфраструктуры:
- ✅ `infrastructure/entities/expense.typeorm-entity.ts`
- ✅ `infrastructure/mappers/expense.mapper.ts`
- ✅ `infrastructure/blockchain/mappers/expense-delta.mapper.ts`
- ✅ `infrastructure/blockchain/services/expense-sync.service.ts`
- ✅ `infrastructure/repositories/expense.typeorm-repository.ts`

### Регистрация:
- ✅ `infrastructure/database/capital-database.module.ts` (добавить сущность)
- ✅ `capital-extension.module.ts` (добавить провайдеры)

---

## ⚠️ Важные замечания

### Документы в блокчейне
- ✅ Всегда используйте `DomainToBlockchainUtils.convertChainDocumentToDomainFormat()` для парсинга
- ✅ Проверяйте названия полей документов в блокчейне
- ✅ Используйте `@Column({ type: 'json' })` для хранения документов

### Типы и интерфейсы
- ✅ Реализуйте `IBlockchainSynchronizable` в доменной сущности
- ✅ Добавьте `block_num` и `present` поля
- ✅ Используйте правильные типы из `cooptypes`

### События и синхронизация
- ✅ Подписывайтесь на правильные паттерны событий
- ✅ Обрабатывайте форки через `capital::fork`
- ✅ Валидируйте все обязательные поля

### Репозитории
- ✅ Реализуйте `IBlockchainSyncRepository`
- ✅ Добавьте методы `findByBlockchainId`, `findByBlockNumGreaterThan`, `createIfNotExists`, `deleteByBlockNumGreaterThan`

---

## 🎯 Следующие шаги

1. **Создайте все файлы по шаблону выше**
2. **Проверьте TypeScript типы**
3. **Зарегистрируйте компоненты в модулях**
4. **Протестируйте синхронизацию**
5. **Добавьте в документацию BLOCKCHAIN_SYNC.md**

**При изменении названий документов в блокчейне - проверяйте все дельта-мапперы!**
