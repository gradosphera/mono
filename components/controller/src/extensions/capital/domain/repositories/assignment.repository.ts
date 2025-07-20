import { AssignmentDomainEntity } from '../entities/assignment.entity';

export interface AssignmentRepository {
  create(assignment: Omit<AssignmentDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentDomainEntity>;
  findById(id: string): Promise<AssignmentDomainEntity | null>;
  findAll(): Promise<AssignmentDomainEntity[]>;
  findByProjectId(projectId: string): Promise<AssignmentDomainEntity[]>;
  findByMaster(masterId: string): Promise<AssignmentDomainEntity[]>;
  findByCreator(creatorId: string): Promise<AssignmentDomainEntity[]>;
  findByStatus(status: string): Promise<AssignmentDomainEntity[]>;
  update(id: string, assignment: Partial<AssignmentDomainEntity>): Promise<AssignmentDomainEntity>;
  delete(id: string): Promise<void>;
}

export const ASSIGNMENT_REPOSITORY = Symbol('AssignmentRepository');
