import { ProjectWalletDomainEntity } from '../../domain/entities/project-wallet.entity';
import { ProjectWalletTypeormEntity } from '../entities/project-wallet.typeorm-entity';
import type { IProjectWalletDatabaseData } from '../../domain/interfaces/project-wallet-database.interface';
import type { IProjectWalletBlockchainData } from '../../domain/interfaces/project-wallet-blockchain.interface';
import type { RequireFields } from '~/shared/utils/require-fields';

type toEntityDatabasePart = RequireFields<Partial<ProjectWalletTypeormEntity>, keyof IProjectWalletDatabaseData>;
type toEntityBlockchainPart = RequireFields<Partial<ProjectWalletTypeormEntity>, keyof IProjectWalletBlockchainData>;

type toDomainDatabasePart = RequireFields<Partial<ProjectWalletDomainEntity>, keyof IProjectWalletDatabaseData>;
type toDomainBlockchainPart = RequireFields<Partial<ProjectWalletDomainEntity>, keyof IProjectWalletBlockchainData>;

/**
 * Маппер для преобразования между доменной сущностью проектного кошелька и TypeORM сущностью
 */
export class ProjectWalletMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ProjectWalletTypeormEntity): ProjectWalletDomainEntity {
    const databaseData: toDomainDatabasePart = {
      _id: entity._id,
      block_num: entity.block_num,
      present: entity.present,
      username: entity.username,
      status: entity.status,
      _created_at: entity._created_at,
      _updated_at: entity._updated_at,
    };

    let blockchainData: toDomainBlockchainPart | undefined;

    if (entity[ProjectWalletDomainEntity.getPrimaryKey()]) {
      // Используем данные из TypeORM сущности
      blockchainData = {
        id: entity.id,
        coopname: entity.coopname,
        project_hash: entity.project_hash,
        username: entity.username,
        shares: entity.shares,
        last_membership_reward_per_share: entity.last_membership_reward_per_share,
        membership_available: entity.membership_available,
      };
    }

    return new ProjectWalletDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: ProjectWalletDomainEntity): Partial<ProjectWalletTypeormEntity> {
    const dbPart: toEntityDatabasePart = {
      _id: domain._id,
      block_num: domain.block_num ?? 0,
      present: domain.present,
      username: domain.username,
      status: domain.status as string,
      _created_at: domain._created_at as Date,
      _updated_at: domain._updated_at as Date,
    };

    let blockchainPart: toEntityBlockchainPart | undefined;

    if (domain[ProjectWalletDomainEntity.getPrimaryKey()]) {
      blockchainPart = {
        id: domain.id as number,
        coopname: domain.coopname as string,
        project_hash: domain.project_hash as string,
        username: domain.username,
        shares: domain.shares as string,
        last_membership_reward_per_share: domain.last_membership_reward_per_share as number,
        membership_available: domain.membership_available as string,
      };
    }

    return { ...dbPart, ...blockchainPart };
  }
}
