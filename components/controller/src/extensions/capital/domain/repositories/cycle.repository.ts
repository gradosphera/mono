import { CycleDomainEntity } from '../interfaces/cycle.entity';

export interface CycleRepository {
  create(cycle: Omit<CycleDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CycleDomainEntity>;
  findById(id: string): Promise<CycleDomainEntity | null>;
  findAll(): Promise<CycleDomainEntity[]>;
  update(id: string, cycle: Partial<CycleDomainEntity>): Promise<CycleDomainEntity>;
  delete(id: string): Promise<void>;
  findByStatus(status: string): Promise<CycleDomainEntity[]>;
}

export const CYCLE_REPOSITORY = Symbol('CycleRepository');
