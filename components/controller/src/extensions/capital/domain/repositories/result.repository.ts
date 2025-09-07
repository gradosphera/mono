import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { ResultDomainEntity } from '../entities/result.entity';

export interface ResultRepository extends IBlockchainSyncRepository<ResultDomainEntity> {
  create(result: Omit<ResultDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResultDomainEntity>;
  findById(_id: string): Promise<ResultDomainEntity | null>;
  findAll(): Promise<ResultDomainEntity[]>;
  findByUsername(username: string): Promise<ResultDomainEntity[]>;
  findByProjectHash(projectHash: string): Promise<ResultDomainEntity[]>;
  findByStatus(status: string): Promise<ResultDomainEntity[]>;
  update(entity: ResultDomainEntity): Promise<ResultDomainEntity>;
  delete(_id: string): Promise<void>;
}

export const RESULT_REPOSITORY = Symbol('ResultRepository');
