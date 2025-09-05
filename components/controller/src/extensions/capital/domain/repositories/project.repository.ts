import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { ProjectDomainEntity } from '../entities/project.entity';

export interface ProjectRepository extends IBlockchainSyncRepository<ProjectDomainEntity> {
  create(project: Omit<ProjectDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectDomainEntity>;
  findById(id: string): Promise<ProjectDomainEntity | null>;
  findAll(): Promise<ProjectDomainEntity[]>;
  findByMaster(master: string): Promise<ProjectDomainEntity[]>;
  findByStatus(status: string): Promise<ProjectDomainEntity[]>;
  update(entity: ProjectDomainEntity): Promise<ProjectDomainEntity>;
  delete(id: string): Promise<void>;
}

export const PROJECT_REPOSITORY = Symbol('ProjectRepository');
