import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultRepository } from '../../domain/repositories/result.repository';
import { ResultDomainEntity } from '../../domain/entities/result.entity';
import { ResultTypeormEntity } from '../entities/result.typeorm-entity';
import { ResultMapper } from '../mappers/result.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IResultBlockchainData } from '../../domain/interfaces/result-blockchain.interface';
import type { IResultDatabaseData } from '../../domain/interfaces/result-database.interface';

@Injectable()
export class ResultTypeormRepository
  extends BaseBlockchainRepository<ResultDomainEntity, ResultTypeormEntity>
  implements ResultRepository, IBlockchainSyncRepository<ResultDomainEntity>
{
  constructor(
    @InjectRepository(ResultTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ResultTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ResultMapper.toDomain,
      toEntity: ResultMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: IResultDatabaseData,
    blockchainData: IResultBlockchainData
  ): ResultDomainEntity {
    return new ResultDomainEntity(databaseData, blockchainData);
  }

  async create(result: ResultDomainEntity): Promise<ResultDomainEntity> {
    const entity = this.repository.create(ResultMapper.toEntity(result));
    const savedEntity = await this.repository.save(entity);
    return ResultMapper.toDomain(savedEntity);
  }

  async findByUsername(username: string): Promise<ResultDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => ResultMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<ResultDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => ResultMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ResultDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ResultMapper.toDomain(entity));
  }
}
