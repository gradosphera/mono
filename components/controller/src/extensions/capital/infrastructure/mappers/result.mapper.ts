import { ResultDomainEntity } from '../../domain/entities/result.entity';
import { ResultTypeormEntity } from '../entities/result.typeorm-entity';
import type { IResultDatabaseData } from '../../domain/interfaces/result-database.interface';
import type { IResultBlockchainData } from '../../domain/interfaces/result-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью результата и TypeORM сущностью
 */
export class ResultMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ResultTypeormEntity): ResultDomainEntity {
    const databaseData: IResultDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IResultBlockchainData = {
      id: entity.blockchain_id || '',
      project_hash: entity.project_hash,
      result_hash: entity.result_hash,
      coopname: entity.coopname,
      username: entity.username,
      status: entity.blockchain_status,
      created_at: entity.created_at.toISOString(),
      creator_base_amount: entity.creator_base_amount,
      author_base_amount: entity.author_base_amount,
      debt_amount: entity.debt_amount,
      creator_bonus_amount: entity.creator_bonus_amount,
      author_bonus_amount: entity.author_bonus_amount,
      generation_amount: entity.generation_amount,
      capitalist_bonus_amount: entity.capitalist_bonus_amount,
      total_amount: entity.total_amount,
      available_for_return: entity.available_for_return,
      available_for_convert: entity.available_for_convert,
      statement: entity.statement,
      authorization: entity.authorization,
      act: entity.act,
    };

    return new ResultDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ResultDomainEntity>): Partial<ResultTypeormEntity> {
    const entity: Partial<ResultTypeormEntity> = {
      blockchain_id: domain.blockchain_id ? domain.blockchain_id : '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.result_hash !== undefined) entity.result_hash = domain.result_hash;
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus;
    if (domain.created_at !== undefined) entity.created_at = new Date(domain.created_at);
    if (domain.creator_base_amount !== undefined) entity.creator_base_amount = domain.creator_base_amount;
    if (domain.author_base_amount !== undefined) entity.author_base_amount = domain.author_base_amount;
    if (domain.debt_amount !== undefined) entity.debt_amount = domain.debt_amount;
    if (domain.creator_bonus_amount !== undefined) entity.creator_bonus_amount = domain.creator_bonus_amount;
    if (domain.author_bonus_amount !== undefined) entity.author_bonus_amount = domain.author_bonus_amount;
    if (domain.generation_amount !== undefined) entity.generation_amount = domain.generation_amount;
    if (domain.capitalist_bonus_amount !== undefined) entity.capitalist_bonus_amount = domain.capitalist_bonus_amount;
    if (domain.total_amount !== undefined) entity.total_amount = domain.total_amount;
    if (domain.available_for_return !== undefined) entity.available_for_return = domain.available_for_return;
    if (domain.available_for_convert !== undefined) entity.available_for_convert = domain.available_for_convert;
    if (domain.statement !== undefined) entity.statement = domain.statement;
    if (domain.authorization !== undefined) entity.authorization = domain.authorization;
    if (domain.act !== undefined) entity.act = domain.act;

    // Доменные поля
    if (domain.status !== undefined) entity.status = domain.status;

    return entity;
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<ResultDomainEntity>): Partial<ResultTypeormEntity> {
    const updateData: Partial<ResultTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num || undefined;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (project_hash, result_hash, status, amounts, etc.)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
