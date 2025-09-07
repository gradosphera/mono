import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { ContributorDomainEntity } from '../entities/contributor.entity';

export interface ContributorRepository extends IBlockchainSyncRepository<ContributorDomainEntity> {
  create(contributor: Omit<ContributorDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContributorDomainEntity>;
  findById(_id: string): Promise<ContributorDomainEntity | null>;
  findAll(): Promise<ContributorDomainEntity[]>;
  findByUsername(username: string): Promise<ContributorDomainEntity[]>;
  findByStatus(status: string): Promise<ContributorDomainEntity[]>;
  update(entity: ContributorDomainEntity): Promise<ContributorDomainEntity>;
  delete(_id: string): Promise<void>;
}

export const CONTRIBUTOR_REPOSITORY = Symbol('ContributorRepository');
