import { ResultDomainEntity } from '../../domain/entities/result.entity';
import { ResultTypeormEntity } from '../entities/result.typeorm-entity';
import type { IResultDatabaseData } from '../../domain/interfaces/result-database.interface';
import type { IResultBlockchainData } from '../../domain/interfaces/result-blockchain.interface';
import type { RequireFields } from '~/shared/utils/require-fields';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

type toEntityDatabasePart = RequireFields<Partial<ResultTypeormEntity>, keyof IResultDatabaseData>;
type toEntityBlockchainPart = RequireFields<Partial<ResultTypeormEntity>, keyof IResultBlockchainData>;

type toDomainDatabasePart = RequireFields<Partial<ResultDomainEntity>, keyof IResultDatabaseData>;
type toDomainBlockchainPart = RequireFields<Partial<ResultDomainEntity>, keyof IResultBlockchainData>;

/**
 * Маппер для преобразования между доменной сущностью результата и TypeORM сущностью
 */
export class ResultMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ResultTypeormEntity): ResultDomainEntity {
    const databaseData: toDomainDatabasePart = {
      _id: entity._id,
      block_num: entity.block_num,
      present: entity.present,
      result_hash: entity.result_hash,
      status: entity.status,
      blockchain_status: entity.blockchain_status,
    };

    let blockchainData: toDomainBlockchainPart | undefined;

    if (entity[ResultDomainEntity.getPrimaryKey()] !== undefined) {
      // Используем данные из TypeORM сущности
      blockchainData = {
        id: entity.id,
        project_hash: entity.project_hash,
        result_hash: entity.result_hash,
        coopname: entity.coopname,
        username: entity.username,
        status: entity.status,
        blockchain_status: entity.blockchain_status,
        created_at: entity.created_at.toISOString(),
        debt_amount: entity.debt_amount,
        total_amount: entity.total_amount,
        statement: entity.statement,
        authorization: entity.authorization,
        act: entity.act,
      };
    }

    return new ResultDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: ResultDomainEntity): Partial<ResultTypeormEntity> {
    const dbPart: toEntityDatabasePart = {
      _id: domain._id,
      block_num: domain.block_num ?? 0,
      present: domain.present,
      result_hash: domain.result_hash,
      status: domain.status,
      blockchain_status: domain.blockchain_status as string,
    };

    let blockchainPart: toEntityBlockchainPart | undefined;

    if (domain[ResultDomainEntity.getPrimaryKey()] !== undefined) {
      blockchainPart = {
        id: domain.id as number,
        project_hash: domain.project_hash as string,
        result_hash: domain.result_hash,
        coopname: domain.coopname as string,
        username: domain.username as string,
        status: domain.blockchain_status as any,
        created_at: new Date(domain.created_at ?? new Date()),
        debt_amount: domain.debt_amount as string,
        total_amount: domain.total_amount as string,
        statement: domain.statement as ISignedDocumentDomainInterface,
        authorization: domain.authorization as ISignedDocumentDomainInterface,
        act: domain.act as ISignedDocumentDomainInterface,
      };
    }

    return { ...dbPart, ...blockchainPart };
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<ResultDomainEntity>): Partial<ResultTypeormEntity> {
    const updateData: Partial<ResultTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (project_hash, result_hash, status, amounts, etc.)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
