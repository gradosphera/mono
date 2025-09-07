import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestRepository } from '../../domain/repositories/invest.repository';
import { InvestDomainEntity } from '../../domain/entities/invest.entity';
import { InvestTypeormEntity } from '../entities/invest.typeorm-entity';
import { InvestMapper } from '../mappers/invest.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IInvestDatabaseData } from '../../domain/interfaces/invest-database.interface';
import type { IInvestBlockchainData } from '../../domain/interfaces/invest-blockchain.interface';

@Injectable()
export class InvestTypeormRepository
  extends BaseBlockchainRepository<InvestDomainEntity, InvestTypeormEntity>
  implements InvestRepository, IBlockchainSyncRepository<InvestDomainEntity>
{
  constructor(
    @InjectRepository(InvestTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<InvestTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: InvestMapper.toDomain,
      toEntity: InvestMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: IInvestDatabaseData,
    blockchainData: IInvestBlockchainData
  ): InvestDomainEntity {
    return new InvestDomainEntity(databaseData, blockchainData);
  }

  async create(invest: InvestDomainEntity): Promise<InvestDomainEntity> {
    const entity = this.repository.create(InvestMapper.toEntity(invest));
    const savedEntity = await this.repository.save(entity);
    return InvestMapper.toDomain(savedEntity);
  }

  async findByUsername(username: string): Promise<InvestDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => InvestMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<InvestDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => InvestMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<InvestDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => InvestMapper.toDomain(entity));
  }
}
