import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramWithdrawDomainEntity } from '../../domain/entities/program-withdraw.entity';
import { ProgramWithdrawTypeormEntity } from '../entities/program-withdraw.typeorm-entity';
import { ProgramWithdrawMapper } from '../mappers/program-withdraw.mapper';
import type { ProgramWithdrawRepository } from '../../domain/repositories/program-withdraw.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import { BaseBlockchainRepository } from './base-blockchain.repository';

/**
 * TypeORM реализация репозитория возвратов из программы
 */
@Injectable()
export class ProgramWithdrawTypeormRepository
  extends BaseBlockchainRepository<ProgramWithdrawDomainEntity, ProgramWithdrawTypeormEntity>
  implements ProgramWithdrawRepository
{
  constructor(
    @InjectRepository(ProgramWithdrawTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ProgramWithdrawTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ProgramWithdrawMapper.toDomain,
      toEntity: ProgramWithdrawMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: { _id: string; id: string; block_num: number; present: boolean },
    blockchainData: any
  ): ProgramWithdrawDomainEntity {
    return new ProgramWithdrawDomainEntity(databaseData, blockchainData);
  }
}
