import { CommitDomainEntity } from '../interfaces/commit.entity';

export interface CommitRepository {
  create(commit: Omit<CommitDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommitDomainEntity>;
  findById(id: string): Promise<CommitDomainEntity | null>;
  findAll(): Promise<CommitDomainEntity[]>;
  findByAssignmentId(assignmentId: string): Promise<CommitDomainEntity[]>;
  findByCreator(creatorId: string): Promise<CommitDomainEntity[]>;
  findByStatus(status: string): Promise<CommitDomainEntity[]>;
  findPendingReview(): Promise<CommitDomainEntity[]>;
  update(id: string, commit: Partial<CommitDomainEntity>): Promise<CommitDomainEntity>;
  delete(id: string): Promise<void>;
}

export const COMMIT_REPOSITORY = Symbol('CommitRepository');
