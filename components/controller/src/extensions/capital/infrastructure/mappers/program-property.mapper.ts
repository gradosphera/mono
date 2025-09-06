import { ProgramPropertyDomainEntity } from '../../domain/entities/program-property.entity';
import { ProgramPropertyTypeormEntity } from '../entities/program-property.typeorm-entity';
import type { IProgramPropertyDatabaseData } from '../../domain/interfaces/program-property-database.interface';
import type { IProgramPropertyBlockchainData } from '../../domain/interfaces/program-property-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью программного имущественного взноса и TypeORM сущностью
 */
export class ProgramPropertyMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ProgramPropertyTypeormEntity): ProgramPropertyDomainEntity {
    const databaseData: IProgramPropertyDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IProgramPropertyBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      status: entity.blockchain_status,
      property_hash: entity.property_hash,
      property_amount: entity.property_amount,
      property_description: entity.property_description,
      statement: entity.statement,
      authorization: entity.authorization,
      act: entity.act,
      created_at: entity.created_at.toISOString(),
    };

    return new ProgramPropertyDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ProgramPropertyDomainEntity>): Partial<ProgramPropertyTypeormEntity> {
    const entity: Partial<ProgramPropertyTypeormEntity> = {
      blockchain_id: domain.blockchain_id || '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus.toString();
    if (domain.property_hash !== undefined) entity.property_hash = domain.property_hash;
    if (domain.property_amount !== undefined) entity.property_amount = domain.property_amount;
    if (domain.property_description !== undefined) entity.property_description = domain.property_description;
    if (domain.statement !== undefined) entity.statement = domain.statement;
    if (domain.authorization !== undefined) entity.authorization = domain.authorization;
    if (domain.act !== undefined) entity.act = domain.act;
    if (domain.created_at !== undefined) entity.created_at = new Date(domain.created_at);

    return entity;
  }
}
