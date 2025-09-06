import { CommitDomainEntity } from '../../domain/entities/commit.entity';
import { CommitTypeormEntity } from '../entities/commit.typeorm-entity';
import type { ICommitDatabaseData } from '../../domain/interfaces/commit-database.interface';
import type { ICommitBlockchainData } from '../../domain/interfaces/commit-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью коммита и TypeORM сущностью
 */
export class CommitMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: CommitTypeormEntity): CommitDomainEntity {
    const databaseData: ICommitDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: ICommitBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      project_hash: entity.project_hash,
      commit_hash: entity.commit_hash,
      amounts: entity.amounts,
      status: entity.blockchain_status,
      created_at: entity.created_at.toISOString(),
    };

    return new CommitDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<CommitDomainEntity>): Partial<CommitTypeormEntity> {
    const entity: Partial<CommitTypeormEntity> = {
      blockchain_id: domain.blockchain_id ? domain.blockchain_id : '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.commit_hash !== undefined) entity.commit_hash = domain.commit_hash;
    if (domain.amounts !== undefined) entity.amounts = domain.amounts;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus;
    if (domain.created_at !== undefined) entity.created_at = new Date(domain.created_at);

    // Доменные поля
    if (domain.status !== undefined) entity.status = domain.status;

    return entity;
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<CommitDomainEntity>): Partial<CommitTypeormEntity> {
    const updateData: Partial<CommitTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num || undefined;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (coopname, commit_hash, status, amounts, etc.)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
