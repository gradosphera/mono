import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppendixDomainEntity } from '../../domain/entities/appendix.entity';
import { AppendixTypeormEntity } from '../entities/appendix.typeorm-entity';
import { AppendixMapper } from '../mappers/appendix.mapper';
import type { AppendixRepository } from '../../domain/repositories/appendix.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import { BaseBlockchainRepository } from './base-blockchain.repository';

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
    databaseData: { id: string; blockchain_id: string; block_num: number; present: boolean },
    blockchainData: any
  ): AppendixDomainEntity {
    return new AppendixDomainEntity(databaseData, blockchainData);
  }

  // Специфичные методы для AppendixRepository

  async findAll(): Promise<AppendixDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map(AppendixMapper.toDomain);
  }

  async findById(id: string): Promise<AppendixDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? AppendixMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
