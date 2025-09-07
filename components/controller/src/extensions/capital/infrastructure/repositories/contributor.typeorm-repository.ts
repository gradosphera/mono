import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributorRepository } from '../../domain/repositories/contributor.repository';
import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';
import { ContributorMapper } from '../mappers/contributor.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import { IContributorDatabaseData } from '../../domain/interfaces/contributor-database.interface';

@Injectable()
export class ContributorTypeormRepository
  extends BaseBlockchainRepository<ContributorDomainEntity, ContributorTypeormEntity>
  implements ContributorRepository, IBlockchainSyncRepository<ContributorDomainEntity>
{
  constructor(
    @InjectRepository(ContributorTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ContributorTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ContributorMapper.toDomain,
      toEntity: ContributorMapper.toEntity,
    };
  }

  protected createDomainEntity(databaseData: IContributorDatabaseData, blockchainData: any): ContributorDomainEntity {
    return new ContributorDomainEntity(databaseData, blockchainData);
  }

  async create(contributor: ContributorDomainEntity): Promise<ContributorDomainEntity> {
    const entity = this.repository.create(ContributorMapper.toEntity(contributor));
    const savedEntity = await this.repository.save(entity);
    return ContributorMapper.toDomain(savedEntity);
  }

  async findByUsername(username: string): Promise<ContributorDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => ContributorMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ContributorDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ContributorMapper.toDomain(entity));
  }
}
