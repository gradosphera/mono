import { CycleDomainEntity } from '../entities/cycle.entity';
import type { CycleStatus } from '../enums/cycle-status.enum';

export interface CycleRepository {
  create(cycle: Omit<CycleDomainEntity, '_id'>): Promise<CycleDomainEntity>;
  findById(_id: string): Promise<CycleDomainEntity | null>;
  findAll(): Promise<CycleDomainEntity[]>;
  findByStatus(status: CycleStatus): Promise<CycleDomainEntity[]>;
  findActiveCycles(): Promise<CycleDomainEntity[]>;
  findByIdWithIssues(cycleId: string): Promise<CycleDomainEntity | null>;
  findActiveCycleWithIssues(): Promise<CycleDomainEntity | null>;
  update(entity: CycleDomainEntity): Promise<CycleDomainEntity>;
  delete(_id: string): Promise<void>;
}

export const CYCLE_REPOSITORY = Symbol('CycleRepository');
