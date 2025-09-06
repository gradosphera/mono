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
      status: entity.blockchain_status,
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
      blockchain_id: domain.blockchain_id ? domain.blockchain_id : '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.expense_hash !== undefined) entity.expense_hash = domain.expense_hash;
    if (domain.fund_id !== undefined) entity.fund_id = domain.fund_id.toString();
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus;
    if (domain.amount !== undefined) entity.amount = domain.amount;
    if (domain.description !== undefined) entity.description = domain.description;
    if (domain.expense_statement !== undefined) entity.expense_statement = domain.expense_statement;
    if (domain.approved_statement !== undefined) entity.approved_statement = domain.approved_statement;
    if (domain.authorization !== undefined) entity.authorization = domain.authorization;
    if (domain.spended_at !== undefined) entity.spended_at = new Date(domain.spended_at);

    // Доменные поля
    if (domain.status !== undefined) entity.status = domain.status;

    return entity;
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<ExpenseDomainEntity>): Partial<ExpenseTypeormEntity> {
    const updateData: Partial<ExpenseTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num || undefined;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (coopname, expense_hash, status, amount, description, etc.)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
