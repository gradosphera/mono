import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectPropertyDomainEntity } from '../../domain/entities/project-property.entity';
import { ProjectPropertyTypeormEntity } from '../entities/project-property.typeorm-entity';
import { ProjectPropertyMapper } from '../mappers/project-property.mapper';
import type { ProjectPropertyRepository } from '../../domain/repositories/project-property.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IProjectPropertyBlockchainData } from '../../domain/interfaces/project-property-blockchain.interface';
import type { IProjectPropertyDatabaseData } from '../../domain/interfaces/project-property-database.interface';

/**
 * TypeORM реализация репозитория проектных имущественных взносов
 */
@Injectable()
export class ProjectPropertyTypeormRepository
  extends BaseBlockchainRepository<ProjectPropertyDomainEntity, ProjectPropertyTypeormEntity>
  implements ProjectPropertyRepository
{
  constructor(
    @InjectRepository(ProjectPropertyTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ProjectPropertyTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ProjectPropertyMapper.toDomain,
      toEntity: ProjectPropertyMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: IProjectPropertyDatabaseData,
    blockchainData: IProjectPropertyBlockchainData
  ): ProjectPropertyDomainEntity {
    return new ProjectPropertyDomainEntity(databaseData, blockchainData);
  }
}
