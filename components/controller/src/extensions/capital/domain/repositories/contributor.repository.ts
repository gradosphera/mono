import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { ContributorDomainEntity } from '../entities/contributor.entity';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { ContributorFilterInputDTO } from '../../application/dto/participation_management/contributor-filter.input';

export interface ContributorRepository extends IBlockchainSyncRepository<ContributorDomainEntity> {
  create(contributor: Omit<ContributorDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContributorDomainEntity>;
  findById(_id: string): Promise<ContributorDomainEntity | null>;
  findAll(): Promise<ContributorDomainEntity[]>;
  findByUsername(username: string): Promise<ContributorDomainEntity[]>;
  findByStatus(status: string): Promise<ContributorDomainEntity[]>;
  findAllPaginated(
    filter?: ContributorFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<ContributorDomainEntity>>;
  update(entity: ContributorDomainEntity): Promise<ContributorDomainEntity>;
  delete(_id: string): Promise<void>;
}

export const CONTRIBUTOR_REPOSITORY = Symbol('ContributorRepository');
