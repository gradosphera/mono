import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { ExpenseDomainEntity } from '../entities/expense.entity';

export interface ExpenseRepository extends IBlockchainSyncRepository<ExpenseDomainEntity> {
  create(expense: Omit<ExpenseDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseDomainEntity>;
  findById(id: string): Promise<ExpenseDomainEntity | null>;
  findAll(): Promise<ExpenseDomainEntity[]>;
  findByUsername(username: string): Promise<ExpenseDomainEntity[]>;
  findByProjectHash(projectHash: string): Promise<ExpenseDomainEntity[]>;
  findByStatus(status: string): Promise<ExpenseDomainEntity[]>;
  update(entity: ExpenseDomainEntity): Promise<ExpenseDomainEntity>;
  delete(id: string): Promise<void>;
}

export const EXPENSE_REPOSITORY = Symbol('ExpenseRepository');
