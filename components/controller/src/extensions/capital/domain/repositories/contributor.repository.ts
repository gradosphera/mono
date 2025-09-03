import { ContributorDomainEntity } from '../interfaces/contributor.entity';

export interface ContributorRepository {
  create(contributor: Omit<ContributorDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContributorDomainEntity>;
  findById(id: string): Promise<ContributorDomainEntity | null>;
  findByUserId(userId: string): Promise<ContributorDomainEntity | null>;
  findAll(): Promise<ContributorDomainEntity[]>;
  findByRole(role: string): Promise<ContributorDomainEntity[]>;
  findActive(): Promise<ContributorDomainEntity[]>;
  update(id: string, contributor: Partial<ContributorDomainEntity>): Promise<ContributorDomainEntity>;
  delete(id: string): Promise<void>;
}

export const CONTRIBUTOR_REPOSITORY = Symbol('ContributorRepository');
