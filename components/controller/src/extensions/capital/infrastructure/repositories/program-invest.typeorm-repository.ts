import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramInvestDomainEntity } from '../../domain/entities/program-invest.entity';
import { ProgramInvestTypeormEntity } from '../entities/program-invest.typeorm-entity';
import { ProgramInvestMapper } from '../mappers/program-invest.mapper';
import type { ProgramInvestRepository } from '../../domain/repositories/program-invest.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IProgramInvestDatabaseData } from '../../domain/interfaces/program-invest-database.interface';
import type { IProgramInvestBlockchainData } from '../../domain/interfaces/program-invest-blockchain.interface';

/**
 * TypeORM реализация репозитория программных инвестиций
 */
@Injectable()
export class ProgramInvestTypeormRepository
  extends BaseBlockchainRepository<ProgramInvestDomainEntity, ProgramInvestTypeormEntity>
  implements ProgramInvestRepository
{
  constructor(
    @InjectRepository(ProgramInvestTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ProgramInvestTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ProgramInvestMapper.toDomain,
      toEntity: ProgramInvestMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: IProgramInvestDatabaseData,
    blockchainData: IProgramInvestBlockchainData
  ): ProgramInvestDomainEntity {
    return new ProgramInvestDomainEntity(databaseData, blockchainData);
  }

  protected getSyncKey(): string {
    return ProgramInvestDomainEntity.getSyncKey();
  }
}
