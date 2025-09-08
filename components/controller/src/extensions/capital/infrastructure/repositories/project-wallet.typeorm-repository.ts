import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectWalletDomainEntity } from '../../domain/entities/project-wallet.entity';
import { ProjectWalletTypeormEntity } from '../entities/project-wallet.typeorm-entity';
import { ProjectWalletMapper } from '../mappers/project-wallet.mapper';
import type { ProjectWalletRepository } from '../../domain/repositories/project-wallet.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IProjectWalletBlockchainData } from '../../domain/interfaces/project-wallet-blockchain.interface';
import type { IProjectWalletDatabaseData } from '../../domain/interfaces/project-wallet-database.interface';

/**
 * TypeORM реализация репозитория проектных кошельков
 */
@Injectable()
export class ProjectWalletTypeormRepository
  extends BaseBlockchainRepository<ProjectWalletDomainEntity, ProjectWalletTypeormEntity>
  implements ProjectWalletRepository
{
  constructor(
    @InjectRepository(ProjectWalletTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ProjectWalletTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ProjectWalletMapper.toDomain,
      toEntity: ProjectWalletMapper.toEntity,
    };
  }

  protected getSyncKey(): string {
    return ProjectWalletDomainEntity.getSyncKey();
  }

  protected createDomainEntity(
    databaseData: IProjectWalletDatabaseData,
    blockchainData: IProjectWalletBlockchainData
  ): ProjectWalletDomainEntity {
    return new ProjectWalletDomainEntity(databaseData, blockchainData);
  }
}
