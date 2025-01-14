// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import type { Cooperative } from 'cooptypes';
import httpStatus from 'http-status';
import { ProjectFreeDecisionDomainEntity } from '~/domain/branch/entities/project-free-decision.entity';
import type { ProjectFreeDecisionRepository } from '~/domain/common/repositories/project-free-decision.repository';
import { HttpApiError } from '~/errors/http-api-error';
import { generator } from '~/services/document.service';

@Injectable()
export class ProjectFreeDecisionRepositoryImplementation implements ProjectFreeDecisionRepository {
  async findById(id: string): Promise<ProjectFreeDecisionDomainEntity> {
    // Используем генератор для извлечения данных из базы

    //TODO присвоение убрать после реализации нормальной типизации в модуле генератора
    const project = (await generator.get('project', { id })) as Cooperative.Document.IProjectData;
    if (!project) throw new HttpApiError(httpStatus.BAD_REQUEST, `Проект решения с идентификатором ${id} не найден`);
    else return new ProjectFreeDecisionDomainEntity(project);
  }

  async create(data: ProjectFreeDecisionDomainEntity): Promise<void> {
    await generator.save('project', data);
  }
}
