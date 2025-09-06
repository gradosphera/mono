import { ProjectPropertyDomainEntity } from '../../domain/entities/project-property.entity';
import { ProjectPropertyTypeormEntity } from '../entities/project-property.typeorm-entity';
import type { IProjectPropertyDatabaseData } from '../../domain/interfaces/project-property-database.interface';
import type { IProjectPropertyBlockchainData } from '../../domain/interfaces/project-property-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью проектного имущественного взноса и TypeORM сущностью
 */
export class ProjectPropertyMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ProjectPropertyTypeormEntity): ProjectPropertyDomainEntity {
    const databaseData: IProjectPropertyDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IProjectPropertyBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      status: entity.blockchain_status,
      project_hash: entity.project_hash,
      property_hash: entity.property_hash,
      property_amount: entity.property_amount,
      property_description: entity.property_description,
      created_at: entity.created_at.toISOString(),
    };

    return new ProjectPropertyDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ProjectPropertyDomainEntity>): Partial<ProjectPropertyTypeormEntity> {
    const entity: Partial<ProjectPropertyTypeormEntity> = {
      blockchain_id: domain.blockchain_id || '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.blockchainStatus !== undefined) entity.blockchain_status = domain.blockchainStatus.toString();
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.property_hash !== undefined) entity.property_hash = domain.property_hash;
    if (domain.property_amount !== undefined) entity.property_amount = domain.property_amount;
    if (domain.property_description !== undefined) entity.property_description = domain.property_description;
    if (domain.created_at !== undefined) entity.created_at = new Date(domain.created_at);

    return entity;
  }
}
