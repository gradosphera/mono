import { ProjectDomainEntity } from '../entities/project.entity';

export interface ProjectRepository {
  create(project: Omit<ProjectDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectDomainEntity>;
  findById(id: string): Promise<ProjectDomainEntity | null>;
  findAll(): Promise<ProjectDomainEntity[]>;
  findByCycleId(cycleId: string): Promise<ProjectDomainEntity[]>;
  findByAuthor(contributorId: string): Promise<ProjectDomainEntity[]>;
  findByMaster(masterId: string): Promise<ProjectDomainEntity[]>;
  findByStatus(status: string): Promise<ProjectDomainEntity[]>;
  update(id: string, project: Partial<ProjectDomainEntity>): Promise<ProjectDomainEntity>;
  delete(id: string): Promise<void>;
}

export const PROJECT_REPOSITORY = Symbol('ProjectRepository');
