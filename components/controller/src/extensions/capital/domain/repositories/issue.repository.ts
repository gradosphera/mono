import { IssueDomainEntity } from '../entities/issue.entity';
import type { IssuePriority } from '../enums/issue-priority.enum';
import type { IssueStatus } from '../enums/issue-status.enum';

export interface IssueRepository {
  create(issue: Omit<IssueDomainEntity, '_id'>): Promise<IssueDomainEntity>;
  findById(_id: string): Promise<IssueDomainEntity | null>;
  findAll(): Promise<IssueDomainEntity[]>;
  findByProjectHash(projectHash: string): Promise<IssueDomainEntity[]>;
  findByCreatedBy(createdBy: string): Promise<IssueDomainEntity[]>;
  findByCreatorsIds(creatorsIds: string[]): Promise<IssueDomainEntity[]>;
  findBySubmasterId(submasterId: string): Promise<IssueDomainEntity[]>;
  findByCycleId(cycleId: string): Promise<IssueDomainEntity[]>;
  findByStatus(status: IssueStatus): Promise<IssueDomainEntity[]>;
  findByPriority(priority: IssuePriority): Promise<IssueDomainEntity[]>;
  findByIdWithComments(issueId: string): Promise<IssueDomainEntity | null>;
  findByIdWithStories(issueId: string): Promise<IssueDomainEntity | null>;
  findByIdWithAllRelations(issueId: string): Promise<IssueDomainEntity | null>;
  findByProjectHashWithComments(projectHash: string): Promise<IssueDomainEntity[]>;
  findByProjectHashWithStories(projectHash: string): Promise<IssueDomainEntity[]>;
  update(entity: IssueDomainEntity): Promise<IssueDomainEntity>;
  delete(_id: string): Promise<void>;
}

export const ISSUE_REPOSITORY = Symbol('IssueRepository');
