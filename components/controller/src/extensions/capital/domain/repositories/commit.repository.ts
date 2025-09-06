import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { CommitDomainEntity } from '../entities/commit.entity';

export interface CommitRepository extends IBlockchainSyncRepository<CommitDomainEntity> {
  create(commit: Omit<CommitDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommitDomainEntity>;
  findById(id: string): Promise<CommitDomainEntity | null>;
  findAll(): Promise<CommitDomainEntity[]>;
  findByUsername(username: string): Promise<CommitDomainEntity[]>;
  findByProjectHash(projectHash: string): Promise<CommitDomainEntity[]>;
  findByStatus(status: string): Promise<CommitDomainEntity[]>;
  update(entity: CommitDomainEntity): Promise<CommitDomainEntity>;
  delete(id: string): Promise<void>;
}

export const COMMIT_REPOSITORY = Symbol('CommitRepository');
