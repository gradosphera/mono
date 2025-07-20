import { ProjectDomainEntity } from '../../domain/entities/project.entity';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';

export class ProjectMapper {
  static toDomain(entity: ProjectTypeormEntity): ProjectDomainEntity {
    return {
      id: entity.id,
      cycleId: entity.cycleId,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      authors: entity.authors,
      masterId: entity.masterId,
      plannedHours: Number(entity.plannedHours),
      plannedExpenses: Number(entity.plannedExpenses),
      actualHours: Number(entity.actualHours),
      actualExpenses: Number(entity.actualExpenses),
      totalInvestment: Number(entity.totalInvestment),
      availableInvestment: Number(entity.availableInvestment),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toEntity(domain: Omit<ProjectDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Partial<ProjectTypeormEntity> {
    return {
      cycleId: domain.cycleId,
      title: domain.title,
      description: domain.description,
      status: domain.status,
      authors: domain.authors,
      masterId: domain.masterId,
      plannedHours: domain.plannedHours,
      plannedExpenses: domain.plannedExpenses,
      actualHours: domain.actualHours,
      actualExpenses: domain.actualExpenses,
      totalInvestment: domain.totalInvestment,
      availableInvestment: domain.availableInvestment,
    };
  }

  static toUpdateEntity(domain: Partial<ProjectDomainEntity>): Partial<ProjectTypeormEntity> {
    const entity: Partial<ProjectTypeormEntity> = {};

    if (domain.cycleId !== undefined) entity.cycleId = domain.cycleId;
    if (domain.title !== undefined) entity.title = domain.title;
    if (domain.description !== undefined) entity.description = domain.description;
    if (domain.status !== undefined) entity.status = domain.status;
    if (domain.authors !== undefined) entity.authors = domain.authors;
    if (domain.masterId !== undefined) entity.masterId = domain.masterId;
    if (domain.plannedHours !== undefined) entity.plannedHours = domain.plannedHours;
    if (domain.plannedExpenses !== undefined) entity.plannedExpenses = domain.plannedExpenses;
    if (domain.actualHours !== undefined) entity.actualHours = domain.actualHours;
    if (domain.actualExpenses !== undefined) entity.actualExpenses = domain.actualExpenses;
    if (domain.totalInvestment !== undefined) entity.totalInvestment = domain.totalInvestment;
    if (domain.availableInvestment !== undefined) entity.availableInvestment = domain.availableInvestment;

    return entity;
  }
}
