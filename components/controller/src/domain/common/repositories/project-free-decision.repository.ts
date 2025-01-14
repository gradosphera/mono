import type { ProjectFreeDecisionDomainEntity } from '~/domain/branch/entities/project-free-decision.entity';

export interface ProjectFreeDecisionRepository {
  /**
   * Получить данные о проекте решения по идентификатору
   * @param id Идентификатор проекта решения
   */
  findById(id: string): Promise<ProjectFreeDecisionDomainEntity>;
  create(data: ProjectFreeDecisionDomainEntity);
}

export const PROJECT_FREE_DECISION_REPOSITORY = Symbol('ProjectFreeDecisionRepository');
