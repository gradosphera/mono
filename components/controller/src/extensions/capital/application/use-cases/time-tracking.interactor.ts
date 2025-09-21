import { Injectable, Inject } from '@nestjs/common';
import { TIME_ENTRY_REPOSITORY, TimeEntryRepository } from '../../domain/repositories/time-entry.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/repositories/project.repository';
import type { GetTimeStatsDomainInput } from '../../domain/actions/get-time-stats-domain-input.interface';
import type { GetContributorProjectsTimeStatsDomainInput } from '../../domain/actions/get-contributor-projects-time-stats-domain-input.interface';
import type { GetTimeEntriesDomainInput } from '../../domain/actions/get-time-entries-domain-input.interface';
import type { GetFlexibleTimeStatsDomainInput } from '../../domain/actions/get-flexible-time-stats-domain-input.interface';
import type { TimeStatsDomainInterface } from '../../domain/interfaces/time-stats-domain.interface';
import type { ContributorProjectsTimeStatsDomainInterface } from '../../domain/interfaces/contributor-projects-time-stats-domain.interface';
import type { TimeEntriesResultDomainInterface } from '../../domain/interfaces/time-entries-result-domain.interface';
import type { TimeEntriesFilterDomainInterface } from '../../domain/interfaces/time-entries-filter-domain.interface';
import type { FlexibleTimeStatsResultDomainInterface } from '../../domain/interfaces/flexible-time-stats-domain.interface';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { ProjectTimeStatsDomainInterface } from '../../domain/interfaces/project-time-stats-domain.interface';

/**
 * Интерактор домена для учёта времени в CAPITAL контракте
 * Обрабатывает запросы связанные со статистикой времени и записями времени
 */
@Injectable()
export class TimeTrackingInteractor {
  constructor(
    @Inject(TIME_ENTRY_REPOSITORY)
    private readonly timeEntryRepository: TimeEntryRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository
  ) {}

  /**
   * Получение статистики времени вкладчика по проекту
   */
  async getTimeStats(data: GetTimeStatsDomainInput): Promise<TimeStatsDomainInterface> {
    const stats = await this.timeEntryRepository.getContributorProjectStats(data.contributor_hash, data.project_hash);

    return {
      contributor_hash: data.contributor_hash,
      project_hash: data.project_hash,
      total_committed_hours: stats.total_committed_hours,
      total_uncommitted_hours: stats.total_uncommitted_hours,
      available_hours: stats.available_hours,
    };
  }

  /**
   * Получение списка проектов вкладчика со статистикой времени
   */
  async getContributorProjectsTimeStats(
    data: GetContributorProjectsTimeStatsDomainInput
  ): Promise<ContributorProjectsTimeStatsDomainInterface> {
    // Получаем все проекты, где у вкладчика есть записи времени
    const projectsWithTime = await this.timeEntryRepository.findProjectsByContributor(data.contributor_hash);

    // Для каждого проекта получаем информацию о проекте и статистику времени
    const projectsStats = await Promise.all(
      projectsWithTime.map(async (projectInfo) => {
        // Получаем информацию о проекте
        const project = await this.projectRepository.findByHash(projectInfo.project_hash);

        // Получаем статистику времени для этого проекта
        const timeStats = await this.timeEntryRepository.getContributorProjectStats(
          data.contributor_hash,
          projectInfo.project_hash
        );

        return {
          project_hash: projectInfo.project_hash,
          project_name: project?.title || 'Unknown Project',
          contributor_hash: data.contributor_hash,
          total_committed_hours: timeStats.total_committed_hours,
          total_uncommitted_hours: timeStats.total_uncommitted_hours,
          available_hours: timeStats.available_hours,
        };
      })
    );

    return {
      contributor_hash: data.contributor_hash,
      projects: projectsStats,
    };
  }

  /**
   * Получение пагинированных записей времени по проекту или всем проектам
   */
  async getTimeEntries(
    data: GetTimeEntriesDomainInput,
    options?: PaginationInputDomainInterface
  ): Promise<TimeEntriesResultDomainInterface> {
    const filter: TimeEntriesFilterDomainInterface = {
      projectHash: data.project_hash,
      contributorHash: data.contributor_hash,
      isCommitted: data.is_committed,
      coopname: data.coopname,
    };

    return await this.timeEntryRepository.findByProjectWithPagination(filter, options);
  }

  /**
   * Гибкий запрос статистики времени с пагинацией
   */
  async getFlexibleTimeStats(
    data: GetFlexibleTimeStatsDomainInput,
    options?: PaginationInputDomainInterface
  ): Promise<FlexibleTimeStatsResultDomainInterface> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    let results: ProjectTimeStatsDomainInterface[] = [];

    // Логика фильтрации
    if (data.contributor_hash && data.project_hash) {
      // Один проект для одного вкладчика
      const project = await this.projectRepository.findByHash(data.project_hash);
      const timeStats = await this.timeEntryRepository.getContributorProjectStats(data.contributor_hash, data.project_hash);

      results = [
        {
          project_hash: data.project_hash,
          project_name: project?.title || 'Неизвестный проект',
          contributor_hash: data.contributor_hash,
          total_committed_hours: timeStats.total_committed_hours,
          total_uncommitted_hours: timeStats.total_uncommitted_hours,
          available_hours: timeStats.available_hours,
        },
      ];
    } else if (data.contributor_hash) {
      // Все проекты для одного вкладчика
      const projectsWithTime = await this.timeEntryRepository.findProjectsByContributor(data.contributor_hash);

      const projectStatsPromises = projectsWithTime.map(async (projectInfo) => {
        const project = await this.projectRepository.findByHash(projectInfo.project_hash);
        const timeStats = await this.timeEntryRepository.getContributorProjectStats(
          data.contributor_hash as string,
          projectInfo.project_hash
        );

        return {
          project_hash: projectInfo.project_hash,
          project_name: project?.title || 'Неизвестный проект',
          contributor_hash: data.contributor_hash as string,
          total_committed_hours: timeStats.total_committed_hours,
          total_uncommitted_hours: timeStats.total_uncommitted_hours,
          available_hours: timeStats.available_hours,
        };
      });

      results = await Promise.all(projectStatsPromises);
    } else if (data.project_hash) {
      // Все вкладчики для одного проекта
      const contributorsWithTime = await this.timeEntryRepository.findContributorsByProject(data.project_hash);
      const project = await this.projectRepository.findByHash(data.project_hash);

      const contributorStatsPromises = contributorsWithTime.map(async (contributorInfo) => {
        const timeStats = await this.timeEntryRepository.getContributorProjectStats(
          contributorInfo.contributor_hash,
          data.project_hash as string
        );

        return {
          project_hash: data.project_hash as string,
          project_name: project?.title || 'Неизвестный проект',
          contributor_hash: contributorInfo.contributor_hash as string,
          total_committed_hours: timeStats.total_committed_hours,
          total_uncommitted_hours: timeStats.total_uncommitted_hours,
          available_hours: timeStats.available_hours,
        };
      });

      results = await Promise.all(contributorStatsPromises);
    } else {
      // Все проекты и все вкладчики
      // Получаем все проекты
      const allProjects = await this.projectRepository.findAll();

      // Для каждого проекта получаем всех вкладчиков
      const allStatsPromises: Array<Promise<ProjectTimeStatsDomainInterface[]>> = [];

      for (const project of allProjects) {
        allStatsPromises.push(
          (async () => {
            const contributorsWithTime = await this.timeEntryRepository.findContributorsByProject(project.project_hash);
            const contributorStatsPromises = contributorsWithTime.map(async (contributorInfo) => {
              const timeStats = await this.timeEntryRepository.getContributorProjectStats(
                contributorInfo.contributor_hash,
                project.project_hash
              );

              return {
                project_hash: project.project_hash,
                project_name: project.title || 'Неизвестный проект',
                contributor_hash: contributorInfo.contributor_hash,
                total_committed_hours: timeStats.total_committed_hours,
                total_uncommitted_hours: timeStats.total_uncommitted_hours,
                available_hours: timeStats.available_hours,
              };
            });

            return await Promise.all(contributorStatsPromises);
          })()
        );
      }

      const allStatsArrays = await Promise.all(allStatsPromises);
      results = allStatsArrays.flat();
    }

    // Применяем пагинацию
    const totalCount = results.length;
    const paginatedResults = results.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: paginatedResults,
      totalCount,
      currentPage: page,
      totalPages,
    };
  }
}
