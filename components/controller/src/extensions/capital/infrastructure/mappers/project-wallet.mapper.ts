import { ProjectWalletDomainEntity } from '../../domain/entities/project-wallet.entity';
import { ProjectWalletTypeormEntity } from '../entities/project-wallet.typeorm-entity';
import type { IProjectWalletDatabaseData } from '../../domain/interfaces/project-wallet-database.interface';
import type { IProjectWalletBlockchainData } from '../../domain/interfaces/project-wallet-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью проектного кошелька и TypeORM сущностью
 */
export class ProjectWalletMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ProjectWalletTypeormEntity): ProjectWalletDomainEntity {
    const databaseData: IProjectWalletDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IProjectWalletBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      project_hash: entity.project_hash,
      username: entity.username,
      shares: entity.shares,
      last_membership_reward_per_share: entity.last_membership_reward_per_share,
      membership_available: entity.membership_available,
    };

    return new ProjectWalletDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ProjectWalletDomainEntity>): Partial<ProjectWalletTypeormEntity> {
    const entity: Partial<ProjectWalletTypeormEntity> = {
      blockchain_id: domain.blockchain_id || '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.shares !== undefined) entity.shares = domain.shares;
    if (domain.last_membership_reward_per_share !== undefined)
      entity.last_membership_reward_per_share = domain.last_membership_reward_per_share;
    if (domain.membership_available !== undefined) entity.membership_available = domain.membership_available;

    return entity;
  }
}
