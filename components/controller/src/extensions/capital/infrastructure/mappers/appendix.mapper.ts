import { AppendixDomainEntity } from '../../domain/entities/appendix.entity';
import { AppendixTypeormEntity } from '../entities/appendix.typeorm-entity';
import type { IAppendixDatabaseData } from '../../domain/interfaces/appendix-database.interface';
import type { IAppendixBlockchainData } from '../../domain/interfaces/appendix-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью приложения и TypeORM сущностью
 */
export class AppendixMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: AppendixTypeormEntity): AppendixDomainEntity {
    const databaseData: IAppendixDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IAppendixBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      project_hash: entity.project_hash,
      appendix_hash: entity.appendix_hash,
      status: entity.blockchain_status,
      created_at: entity.created_at.toISOString(),
      appendix: entity.appendix,
    };

    return new AppendixDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<AppendixDomainEntity>): Partial<AppendixTypeormEntity> {
    const entity: Partial<AppendixTypeormEntity> = {
      blockchain_id: domain.blockchain_id || '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.appendix_hash !== undefined) entity.appendix_hash = domain.appendix_hash;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus.toString();
    if (domain.created_at !== undefined) entity.created_at = new Date(domain.created_at);
    if (domain.appendix !== undefined) entity.appendix = domain.appendix;

    return entity;
  }
}
