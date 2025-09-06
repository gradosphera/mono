import { ProgramWithdrawDomainEntity } from '../../domain/entities/program-withdraw.entity';
import { ProgramWithdrawTypeormEntity } from '../entities/program-withdraw.typeorm-entity';
import type { IProgramWithdrawDatabaseData } from '../../domain/interfaces/program-withdraw-database.interface';
import type { IProgramWithdrawBlockchainData } from '../../domain/interfaces/program-withdraw-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью возврата из программы и TypeORM сущностью
 */
export class ProgramWithdrawMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ProgramWithdrawTypeormEntity): ProgramWithdrawDomainEntity {
    const databaseData: IProgramWithdrawDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IProgramWithdrawBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      withdraw_hash: entity.withdraw_hash,
      username: entity.username,
      status: entity.blockchain_status,
      amount: entity.amount,
      statement: entity.statement,
      created_at: entity.created_at.toISOString(),
    };

    return new ProgramWithdrawDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ProgramWithdrawDomainEntity>): Partial<ProgramWithdrawTypeormEntity> {
    const entity: Partial<ProgramWithdrawTypeormEntity> = {
      blockchain_id: domain.blockchain_id || '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.withdraw_hash !== undefined) entity.withdraw_hash = domain.withdraw_hash;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus.toString();
    if (domain.amount !== undefined) entity.amount = domain.amount;
    if (domain.statement !== undefined) entity.statement = domain.statement;
    if (domain.created_at !== undefined) entity.created_at = new Date(domain.created_at);

    return entity;
  }
}
