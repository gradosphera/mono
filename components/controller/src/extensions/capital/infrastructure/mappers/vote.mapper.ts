import { VoteDomainEntity } from '../../domain/entities/vote.entity';
import { VoteTypeormEntity } from '../entities/vote.typeorm-entity';
import type { IVoteDatabaseData } from '../../domain/interfaces/vote-database.interface';
import type { IVoteBlockchainData } from '../../domain/interfaces/vote-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью голоса и TypeORM сущностью
 */
export class VoteMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: VoteTypeormEntity): VoteDomainEntity {
    const databaseData: IVoteDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IVoteBlockchainData = {
      id: entity.blockchain_id || '',
      project_hash: entity.project_hash,
      voter: entity.voter,
      recipient: entity.recipient,
      amount: entity.amount,
      voted_at: entity.voted_at.toISOString(),
    };

    return new VoteDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<VoteDomainEntity>): Partial<VoteTypeormEntity> {
    const entity: Partial<VoteTypeormEntity> = {
      blockchain_id: domain.blockchain_id ? domain.blockchain_id : '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.voter !== undefined) entity.voter = domain.voter;
    if (domain.recipient !== undefined) entity.recipient = domain.recipient;
    if (domain.amount !== undefined) entity.amount = domain.amount;
    if (domain.voted_at !== undefined) entity.voted_at = new Date(domain.voted_at);

    return entity;
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<VoteDomainEntity>): Partial<VoteTypeormEntity> {
    const updateData: Partial<VoteTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num || undefined;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (project_hash, voter, recipient, amount, voted_at)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
