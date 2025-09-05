import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';
import type { IContributorDatabaseData } from '../../domain/interfaces/contributor-database.interface';
import type { IContributorBlockchainData } from '../../domain/interfaces/contributor-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью вкладчика и TypeORM сущностью
 */
export class ContributorMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ContributorTypeormEntity): ContributorDomainEntity {
    const databaseData: IContributorDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IContributorBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      contributor_hash: entity.contributor_hash,
      status: entity.blockchain_status,
      memo: entity.memo || '',
      is_external_contract: entity.is_external_contract,
      contract: entity.contract,
      appendixes: entity.appendixes || [],
      rate_per_hour: entity.rate_per_hour || '0.0000 RUB',
      debt_amount: entity.debt_amount || '0.0000 RUB',
      contributed_as_investor: entity.contributed_as_investor || '0.0000 RUB',
      contributed_as_creator: entity.contributed_as_creator || '0.0000 RUB',
      contributed_as_author: entity.contributed_as_author || '0.0000 RUB',
      contributed_as_coordinator: entity.contributed_as_coordinator || '0.0000 RUB',
      contributed_as_contributor: entity.contributed_as_contributor || '0.0000 RUB',
      contributed_as_propertor: entity.contributed_as_propertor || '0.0000 RUB',
      created_at: entity.created_at.toISOString(),
    };

    return new ContributorDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ContributorDomainEntity>): Partial<ContributorTypeormEntity> {
    return {
      blockchain_id: domain.blockchain_id,
      block_num: domain.block_num || undefined,
      present: domain.present,
      coopname: domain.coopname,
      username: domain.username,
      contributor_hash: domain.contributor_hash,
      blockchain_status: domain.blockchain_status,
      memo: domain.memo,
      is_external_contract: domain.is_external_contract,
      contract: domain.contract,
      appendixes: domain.appendixes,
      rate_per_hour: domain.rate_per_hour,
      debt_amount: domain.debt_amount,
      contributed_as_investor: domain.contributed_as_investor,
      contributed_as_creator: domain.contributed_as_creator,
      contributed_as_author: domain.contributed_as_author,
      contributed_as_coordinator: domain.contributed_as_coordinator,
      contributed_as_contributor: domain.contributed_as_contributor,
      contributed_as_propertor: domain.contributed_as_propertor,
      created_at: domain.created_at ? new Date(domain.created_at) : new Date(),
      status: domain.status,
    };
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   */
  static toUpdateEntity(domain: ContributorDomainEntity): Partial<ContributorTypeormEntity> {
    return {
      blockchain_id: domain.blockchain_id,
      block_num: domain.block_num || undefined,
      present: domain.present,
      coopname: domain.coopname,
      username: domain.username,
      contributor_hash: domain.contributor_hash,
      blockchain_status: domain.blockchain_status,
      memo: domain.memo,
      is_external_contract: domain.is_external_contract,
      contract: domain.contract,
      appendixes: domain.appendixes,
      rate_per_hour: domain.rate_per_hour,
      debt_amount: domain.debt_amount,
      contributed_as_investor: domain.contributed_as_investor,
      contributed_as_creator: domain.contributed_as_creator,
      contributed_as_author: domain.contributed_as_author,
      contributed_as_coordinator: domain.contributed_as_coordinator,
      contributed_as_contributor: domain.contributed_as_contributor,
      contributed_as_propertor: domain.contributed_as_propertor,
      created_at: domain.created_at ? new Date(domain.created_at) : new Date(),
      status: domain.status,
    };
  }
}
