import { ResultShareDomainEntity } from '../interfaces/result-share.entity';

export interface ResultShareRepository {
  create(share: Omit<ResultShareDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResultShareDomainEntity>;
  findById(id: string): Promise<ResultShareDomainEntity | null>;
  findAll(): Promise<ResultShareDomainEntity[]>;
  findByProjectId(projectId: string): Promise<ResultShareDomainEntity[]>;
  findByContributor(contributorId: string): Promise<ResultShareDomainEntity[]>;
  findByType(type: string): Promise<ResultShareDomainEntity[]>;
  findCalculated(): Promise<ResultShareDomainEntity[]>;
  findDistributed(): Promise<ResultShareDomainEntity[]>;
  update(id: string, share: Partial<ResultShareDomainEntity>): Promise<ResultShareDomainEntity>;
  delete(id: string): Promise<void>;
}

export const RESULT_SHARE_REPOSITORY = Symbol('ResultShareRepository');
