import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';
import type { IContributorDatabaseData } from '../../domain/interfaces/contributor-database.interface';
import type { IContributorBlockchainData } from '../../domain/interfaces/contributor-blockchain.interface';
import type { RequireFields } from '~/shared/utils/require-fields';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

type toEntityDatabasePart = RequireFields<Partial<ContributorTypeormEntity>, keyof IContributorDatabaseData>;
type toEntityBlockchainPart = RequireFields<Partial<ContributorTypeormEntity>, keyof IContributorBlockchainData>;

type toDomainDatabasePart = RequireFields<Partial<ContributorDomainEntity>, keyof IContributorDatabaseData>;
type toDomainBlockchainPart = RequireFields<Partial<ContributorDomainEntity>, keyof IContributorBlockchainData>;

/**
 * Маппер для преобразования между доменной сущностью участника и TypeORM сущностью
 */
export class ContributorMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ContributorTypeormEntity): ContributorDomainEntity {
    const databaseData: toDomainDatabasePart = {
      _id: entity._id,
      block_num: entity.block_num,
      present: entity.present,
      contributor_hash: entity.contributor_hash,
      status: entity.status,
      blockchain_status: entity.blockchain_status,
      _created_at: entity._created_at,
      _updated_at: entity._updated_at,
      display_name: entity.display_name,
      about: entity.about ?? '',
    };

    let blockchainData: toDomainBlockchainPart | undefined;

    if (entity[ContributorDomainEntity.getPrimaryKey()]) {
      // Используем данные из TypeORM сущности
      blockchainData = {
        id: entity.id,
        coopname: entity.coopname,
        username: entity.username,
        contributor_hash: entity.contributor_hash,
        status: entity.status,
        memo: entity.memo,
        is_external_contract: entity.is_external_contract,
        contract: entity.contract,
        appendixes: entity.appendixes,
        rate_per_hour: entity.rate_per_hour,
        hours_per_day: entity.hours_per_day,
        about: entity.about ?? '',
        debt_amount: entity.debt_amount,
        contributed_as_investor: entity.contributed_as_investor,
        contributed_as_creator: entity.contributed_as_creator,
        contributed_as_author: entity.contributed_as_author,
        contributed_as_coordinator: entity.contributed_as_coordinator,
        contributed_as_contributor: entity.contributed_as_contributor,
        contributed_as_propertor: entity.contributed_as_propertor,
        created_at: entity.created_at.toISOString(),
      };
    }

    return new ContributorDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: ContributorDomainEntity): Partial<ContributorTypeormEntity> {
    const dbPart: toEntityDatabasePart = {
      _id: domain._id,
      block_num: domain.block_num ?? 0,
      present: domain.present,
      contributor_hash: domain.contributor_hash,
      status: domain.status,
      blockchain_status: domain.blockchain_status as string,
      _created_at: domain._created_at as Date,
      _updated_at: domain._updated_at as Date,
      display_name: domain.display_name,
      about: domain.about ?? '',
    };

    let blockchainPart: toEntityBlockchainPart | undefined;

    if (domain[ContributorDomainEntity.getPrimaryKey()]) {
      blockchainPart = {
        id: domain.id as number,
        coopname: domain.coopname as string,
        username: domain.username as string,
        contributor_hash: domain.contributor_hash,
        status: domain.status as any,
        memo: domain.memo as string,
        is_external_contract: domain.is_external_contract as boolean,
        contract: domain.contract as ISignedDocumentDomainInterface,
        appendixes: domain.appendixes as string[],
        rate_per_hour: domain.rate_per_hour as string,
        hours_per_day: domain.hours_per_day as number,
        debt_amount: domain.debt_amount as string,
        contributed_as_investor: domain.contributed_as_investor as string,
        contributed_as_creator: domain.contributed_as_creator as string,
        contributed_as_author: domain.contributed_as_author as string,
        contributed_as_coordinator: domain.contributed_as_coordinator as string,
        contributed_as_contributor: domain.contributed_as_contributor as string,
        contributed_as_propertor: domain.contributed_as_propertor as string,
        created_at: new Date(domain.created_at ?? new Date()),
      };
    }

    return { ...dbPart, ...blockchainPart };
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   */
  static toUpdateEntity(domain: ContributorDomainEntity): Partial<ContributorTypeormEntity> {
    return {
      _id: domain._id,
      id: domain.id,
      block_num: domain.block_num,
      present: domain.present,
      coopname: domain.coopname,
      username: domain.username,
      contributor_hash: domain.contributor_hash,
      display_name: domain.display_name,
      about: domain.about,
      blockchain_status: domain.blockchain_status,
      memo: domain.memo,
      is_external_contract: domain.is_external_contract,
      contract: domain.contract,
      appendixes: domain.appendixes,
      rate_per_hour: domain.rate_per_hour,
      hours_per_day: domain.hours_per_day ? Number(domain.hours_per_day) : 0,
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
