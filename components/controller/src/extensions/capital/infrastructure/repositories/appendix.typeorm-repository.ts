import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppendixDomainEntity } from '../../domain/entities/appendix.entity';
import { AppendixTypeormEntity } from '../entities/appendix.typeorm-entity';
import { AppendixMapper } from '../mappers/appendix.mapper';
import type { AppendixRepository } from '../../domain/repositories/appendix.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import { BaseBlockchainRepository } from '~/shared/sync/repositories/base-blockchain.repository';
import type { IAppendixDatabaseData } from '../../domain/interfaces/appendix-database.interface';
import type { IAppendixBlockchainData } from '../../domain/interfaces/appendix-blockchain.interface';

/**
 * TypeORM реализация репозитория приложений
 */
@Injectable()
export class AppendixTypeormRepository
  extends BaseBlockchainRepository<AppendixDomainEntity, AppendixTypeormEntity>
  implements AppendixRepository
{
  constructor(
    @InjectRepository(AppendixTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<AppendixTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: AppendixMapper.toDomain,
      toEntity: AppendixMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: IAppendixDatabaseData,
    blockchainData: IAppendixBlockchainData
  ): AppendixDomainEntity {
    return new AppendixDomainEntity(databaseData, blockchainData);
  }

  protected getSyncKey(): string {
    return AppendixDomainEntity.getSyncKey();
  }
  // Специфичные методы для AppendixRepository
  // Все типовые CRUD методы наследуются от BaseBlockchainRepository
}
