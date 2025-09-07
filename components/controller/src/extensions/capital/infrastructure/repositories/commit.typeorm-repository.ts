import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommitRepository } from '../../domain/repositories/commit.repository';
import { CommitDomainEntity } from '../../domain/entities/commit.entity';
import { CommitTypeormEntity } from '../entities/commit.typeorm-entity';
import { CommitMapper } from '../mappers/commit.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { ICommitBlockchainData } from '../../domain/interfaces/commit-blockchain.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { ICommitDatabaseData } from '../../domain/interfaces/commit-database.interface';

@Injectable()
export class CommitTypeormRepository
  extends BaseBlockchainRepository<CommitDomainEntity, CommitTypeormEntity>
  implements CommitRepository, IBlockchainSyncRepository<CommitDomainEntity>
{
  constructor(
    @InjectRepository(CommitTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<CommitTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: CommitMapper.toDomain,
      toEntity: CommitMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: ICommitDatabaseData,
    blockchainData: ICommitBlockchainData
  ): CommitDomainEntity {
    return new CommitDomainEntity(databaseData, blockchainData);
  }

  // Специфичные методы для CommitRepository

  async create(commit: CommitDomainEntity): Promise<CommitDomainEntity> {
    const entity = this.repository.create(CommitMapper.toEntity(commit));
    const savedEntity = await this.repository.save(entity);
    return CommitMapper.toDomain(savedEntity);
  }

  async findByUsername(username: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }
}
