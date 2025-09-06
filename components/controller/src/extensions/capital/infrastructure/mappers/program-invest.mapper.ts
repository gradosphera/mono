import { ProgramInvestDomainEntity } from '../../domain/entities/program-invest.entity';
import { ProgramInvestTypeormEntity } from '../entities/program-invest.typeorm-entity';
import type { IProgramInvestDatabaseData } from '../../domain/interfaces/program-invest-database.interface';
import type { IProgramInvestBlockchainData } from '../../domain/interfaces/program-invest-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью программной инвестиции и TypeORM сущностью
 */
export class ProgramInvestMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ProgramInvestTypeormEntity): ProgramInvestDomainEntity {
    const databaseData: IProgramInvestDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IProgramInvestBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      invest_hash: entity.invest_hash,
      status: entity.blockchain_status,
      invested_at: entity.invested_at.toISOString(),
      statement: entity.statement,
      amount: entity.amount,
    };

    return new ProgramInvestDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ProgramInvestDomainEntity>): Partial<ProgramInvestTypeormEntity> {
    const entity: Partial<ProgramInvestTypeormEntity> = {
      blockchain_id: domain.blockchain_id || '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.invest_hash !== undefined) entity.invest_hash = domain.invest_hash;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus.toString();
    if (domain.invested_at !== undefined) entity.invested_at = new Date(domain.invested_at);
    if (domain.statement !== undefined) entity.statement = domain.statement;
    if (domain.amount !== undefined) entity.amount = domain.amount;

    return entity;
  }
}
