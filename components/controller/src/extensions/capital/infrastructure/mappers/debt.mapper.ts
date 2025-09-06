import { DebtDomainEntity } from '../../domain/entities/debt.entity';
import { DebtTypeormEntity } from '../entities/debt.typeorm-entity';
import type { IDebtDatabaseData } from '../../domain/interfaces/debt-database.interface';
import type { IDebtBlockchainData } from '../../domain/interfaces/debt-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью долга и TypeORM сущностью
 */
export class DebtMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: DebtTypeormEntity): DebtDomainEntity {
    const databaseData: IDebtDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IDebtBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      debt_hash: entity.debt_hash,
      project_hash: entity.project_hash,
      status: entity.blockchain_status,
      repaid_at: entity.repaid_at?.toISOString() || '',
      amount: entity.amount,
      statement: entity.statement,
      approved_statement: entity.approved_statement,
      authorization: entity.authorization,
      memo: entity.memo || '',
    };

    return new DebtDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<DebtDomainEntity>): Partial<DebtTypeormEntity> {
    const entity: Partial<DebtTypeormEntity> = {
      blockchain_id: domain.blockchain_id ? domain.blockchain_id : '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.debt_hash !== undefined) entity.debt_hash = domain.debt_hash;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus;
    if (domain.repaid_at !== undefined) entity.repaid_at = domain.repaid_at ? new Date(domain.repaid_at) : undefined;
    if (domain.amount !== undefined) entity.amount = domain.amount;
    if (domain.statement !== undefined) entity.statement = domain.statement;
    if (domain.approved_statement !== undefined) entity.approved_statement = domain.approved_statement;
    if (domain.authorization !== undefined) entity.authorization = domain.authorization;
    if (domain.memo !== undefined) entity.memo = domain.memo || undefined;

    // Доменные поля
    if (domain.status !== undefined) entity.status = domain.status;

    return entity;
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<DebtDomainEntity>): Partial<DebtTypeormEntity> {
    const updateData: Partial<DebtTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num || undefined;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (coopname, debt_hash, status, amount, etc.)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
