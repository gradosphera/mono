import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';
import { ExpenseDomainEntity } from '../../domain/entities/expense.entity';
import { ExpenseTypeormEntity } from '../entities/expense.typeorm-entity';
import { ExpenseMapper } from '../mappers/expense.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IExpenseBlockchainData } from '../../domain/interfaces/expense-blockchain.interface';
import type { IExpenseDatabaseData } from '../../domain/interfaces/expense-database.interface';

@Injectable()
export class ExpenseTypeormRepository
  extends BaseBlockchainRepository<ExpenseDomainEntity, ExpenseTypeormEntity>
  implements ExpenseRepository, IBlockchainSyncRepository<ExpenseDomainEntity>
{
  constructor(
    @InjectRepository(ExpenseTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ExpenseTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ExpenseMapper.toDomain,
      toEntity: ExpenseMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: IExpenseDatabaseData,
    blockchainData: IExpenseBlockchainData
  ): ExpenseDomainEntity {
    return new ExpenseDomainEntity(databaseData, blockchainData);
  }

  async create(expense: ExpenseDomainEntity): Promise<ExpenseDomainEntity> {
    const entity = this.repository.create(ExpenseMapper.toEntity(expense));
    const savedEntity = await this.repository.save(entity);
    return ExpenseMapper.toDomain(savedEntity);
  }

  async findByUsername(username: string): Promise<ExpenseDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => ExpenseMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<ExpenseDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => ExpenseMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ExpenseDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ExpenseMapper.toDomain(entity));
  }
}
