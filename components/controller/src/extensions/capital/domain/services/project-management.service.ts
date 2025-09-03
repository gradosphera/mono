import { Inject, Injectable } from '@nestjs/common';
import { ProjectDomainEntity, ProjectStatus } from '../interfaces/project.entity';
import { PROJECT_REPOSITORY, ProjectRepository } from '../repositories/project.repository';
import { CYCLE_REPOSITORY, CycleRepository } from '../repositories/cycle.repository';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../repositories/contributor.repository';

@Injectable()
export class ProjectManagementService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(CYCLE_REPOSITORY) private readonly cycleRepository: CycleRepository,
    @Inject(CONTRIBUTOR_REPOSITORY) private readonly contributorRepository: ContributorRepository
  ) {}

  async createProject(data: {
    cycleId: string;
    title: string;
    description: string;
    authors: Array<{ contributorId: string; sharePercent: number }>;
    masterId?: string;
  }): Promise<ProjectDomainEntity> {
    // Валидация цикла
    const cycle = await this.cycleRepository.findById(data.cycleId);
    if (!cycle) {
      throw new Error('Цикл не найден');
    }

    // Валидация авторов
    for (const author of data.authors) {
      const contributor = await this.contributorRepository.findById(author.contributorId);
      if (!contributor) {
        throw new Error(`Вкладчик ${author.contributorId} не найден`);
      }
    }

    // Валидация долей авторов (должны составлять 100%)
    const totalShares = data.authors.reduce((sum, author) => sum + author.sharePercent, 0);
    if (Math.abs(totalShares - 100) > 0.01) {
      throw new Error('Сумма долей авторов должна составлять 100%');
    }

    const project = await this.projectRepository.create({
      cycleId: data.cycleId,
      title: data.title,
      description: data.description,
      status: ProjectStatus.WAITING,
      authors: data.authors,
      masterId: data.masterId,
      plannedHours: 0,
      plannedExpenses: 0,
      actualHours: 0,
      actualExpenses: 0,
      totalInvestment: 0,
      availableInvestment: 0,
    });

    return project;
  }

  async updateProjectStatus(projectId: string, newStatus: ProjectStatus): Promise<ProjectDomainEntity> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Проект не найден');
    }

    // Валидация переходов статусов
    this.validateStatusTransition(project.status, newStatus);

    const updatedProject = await this.projectRepository.update(projectId, {
      status: newStatus,
    });

    return updatedProject;
  }

  async assignMaster(projectId: string, masterId: string): Promise<ProjectDomainEntity> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Проект не найден');
    }

    const master = await this.contributorRepository.findById(masterId);
    if (!master) {
      throw new Error('Мастер не найден');
    }

    const updatedProject = await this.projectRepository.update(projectId, {
      masterId: masterId,
    });

    return updatedProject;
  }

  private validateStatusTransition(currentStatus: ProjectStatus, newStatus: ProjectStatus): void {
    const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      [ProjectStatus.WAITING]: [ProjectStatus.PLANNING],
      [ProjectStatus.PLANNING]: [ProjectStatus.EXECUTION, ProjectStatus.WAITING],
      [ProjectStatus.EXECUTION]: [ProjectStatus.REVIEW, ProjectStatus.PLANNING],
      [ProjectStatus.REVIEW]: [ProjectStatus.DISTRIBUTION, ProjectStatus.EXECUTION],
      [ProjectStatus.DISTRIBUTION]: [ProjectStatus.CLOSED],
      [ProjectStatus.CLOSED]: [], // Из закрытого статуса переходов нет
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Недопустимый переход статуса с ${currentStatus} на ${newStatus}`);
    }
  }
}
