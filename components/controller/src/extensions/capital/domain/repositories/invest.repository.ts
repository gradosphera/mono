import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { InvestDomainEntity } from '../entities/invest.entity';

export interface InvestRepository extends IBlockchainSyncRepository<InvestDomainEntity> {
  create(invest: Omit<InvestDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvestDomainEntity>;
  findById(id: string): Promise<InvestDomainEntity | null>;
  findAll(): Promise<InvestDomainEntity[]>;
  findByUsername(username: string): Promise<InvestDomainEntity[]>;
  findByProjectHash(projectHash: string): Promise<InvestDomainEntity[]>;
  findByStatus(status: string): Promise<InvestDomainEntity[]>;
  update(entity: InvestDomainEntity): Promise<InvestDomainEntity>;
  delete(id: string): Promise<void>;
}

export const INVEST_REPOSITORY = Symbol('InvestRepository');
