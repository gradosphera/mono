import { InvestDomainEntity } from '../../domain/entities/invest.entity';
import { InvestTypeormEntity } from '../entities/invest.typeorm-entity';
import type { IInvestDatabaseData } from '../../domain/interfaces/invest-database.interface';
import type { IInvestBlockchainData } from '../../domain/interfaces/invest-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью инвестиции и TypeORM сущностью
 */
export class InvestMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: InvestTypeormEntity): InvestDomainEntity {
    const databaseData: IInvestDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IInvestBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      invest_hash: entity.invest_hash,
      project_hash: entity.project_hash,
      status: entity.blockchain_status,
      amount: entity.amount,
      invested_at: entity.invested_at.toISOString(),
      statement: entity.statement,
      coordinator: entity.coordinator || '',
      coordinator_amount: entity.coordinator_amount || '',
    };

    return new InvestDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<InvestDomainEntity>): Partial<InvestTypeormEntity> {
    const entity: Partial<InvestTypeormEntity> = {
      blockchain_id: domain.blockchain_id ? domain.blockchain_id : '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.invest_hash !== undefined) entity.invest_hash = domain.invest_hash;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.blockchain_status !== undefined) entity.blockchain_status = domain.blockchain_status;
    if (domain.amount !== undefined) entity.amount = domain.amount;
    if (domain.invested_at !== undefined) entity.invested_at = new Date(domain.invested_at);
    if (domain.statement !== undefined) entity.statement = domain.statement;
    if (domain.coordinator !== undefined) entity.coordinator = domain.coordinator || undefined;
    if (domain.coordinator_amount !== undefined) entity.coordinator_amount = domain.coordinator_amount || undefined;

    // Доменные поля
    if (domain.status !== undefined) entity.status = domain.status;

    return entity;
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<InvestDomainEntity>): Partial<InvestTypeormEntity> {
    const updateData: Partial<InvestTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.id !== undefined) updateData.blockchain_id = domain.blockchain_id;
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num || undefined;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (coopname, invest_hash, status, amount, invested_at, statement, coordinator, coordinator_amount)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
