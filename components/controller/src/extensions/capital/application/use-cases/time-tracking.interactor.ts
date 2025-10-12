import { Injectable, Inject } from '@nestjs/common';
import { TIME_ENTRY_REPOSITORY, TimeEntryRepository } from '../../domain/repositories/time-entry.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/repositories/project.repository';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../../domain/repositories/contributor.repository';
import { ISSUE_REPOSITORY, IssueRepository } from '../../domain/repositories/issue.repository';
import { TimeEntryDomainEntity } from '../../domain/entities/time-entry.entity';
import { IssueStatus } from '../../domain/enums/issue-status.enum';
import { ContributorStatus } from '../../domain/enums/contributor-status.enum';
import type { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
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
import type { TimeEntriesByIssuesResultDomainInterface } from '../../domain/interfaces/time-entries-by-issues-domain.interface';
import type {
  ContributorProjectBasicTimeStatsDomainInterface,
  ContributorProjectTimeStatsDomainInterface,
} from '../../domain/interfaces/time-stats-domain.interface';
import { IssueDomainEntity } from '../../domain/entities/issue.entity';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { config } from '~/config';

/**
 * Интерактор домена для учёта времени в CAPITAL контракте
 * Содержит всю бизнес-логику учёта и управления временем
 */
@Injectable()
export class TimeTrackingInteractor {
  constructor(
    @Inject(TIME_ENTRY_REPOSITORY)
    private readonly timeEntryRepository: TimeEntryRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
    @Inject(ISSUE_REPOSITORY)
    private readonly issueRepository: IssueRepository,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(TimeTrackingInteractor.name);
  }

  /**
   * Получение статистики времени вкладчика по проекту
   */
  async getTimeStats(data: GetTimeStatsDomainInput): Promise<TimeStatsDomainInterface> {
    // Получаем базовую статистику из репозитория
    const basicStats = await this.timeEntryRepository.getContributorProjectStats(data.contributor_hash, data.project_hash);

    // Рассчитываем детальную статистику с учётом статуса задач
    const detailedStats = await this.calculateDetailedProjectStats(data.contributor_hash, data.project_hash, basicStats);

    return {
      contributor_hash: data.contributor_hash,
      project_hash: data.project_hash,
      total_committed_hours: detailedStats.total_committed_hours,
      total_uncommitted_hours: detailedStats.total_uncommitted_hours,
      available_hours: detailedStats.available_hours,
      pending_hours: detailedStats.pending_hours,
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

        // Получаем базовую статистику времени для этого проекта
        const basicTimeStats = await this.timeEntryRepository.getContributorProjectStats(
          data.contributor_hash,
          projectInfo.project_hash
        );

        // Рассчитываем детальную статистику
        const timeStats = await this.calculateDetailedProjectStats(
          data.contributor_hash,
          projectInfo.project_hash,
          basicTimeStats
        );

        return {
          project_hash: projectInfo.project_hash,
          project_name: project?.title || 'Unknown Project',
          contributor_hash: data.contributor_hash,
          total_committed_hours: timeStats.total_committed_hours,
          total_uncommitted_hours: timeStats.total_uncommitted_hours,
          available_hours: timeStats.available_hours,
          pending_hours: timeStats.pending_hours,
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
      issueHash: data.issue_hash,
      isCommitted: data.is_committed,
      coopname: data.coopname,
      username: data.username,
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

    // Если передан username, находим contributor_hash
    let contributorHash = data.contributor_hash;

    if (data.username && !contributorHash) {
      const contributor = await this.contributorRepository.findByUsernameAndCoopname(
        data.username,
        data.coopname || config.coopname
      );
      if (contributor) {
        contributorHash = contributor.contributor_hash;
      } else {
        // Если contributor не найден, возвращаем пустой результат
        return {
          items: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
        };
      }
    }

    // Логика фильтрации
    if (contributorHash && data.project_hash) {
      // Один проект для одного вкладчика
      const project = await this.projectRepository.findByHash(data.project_hash);
      const basicTimeStats = await this.timeEntryRepository.getContributorProjectStats(contributorHash, data.project_hash);
      const timeStats = await this.calculateDetailedProjectStats(contributorHash, data.project_hash, basicTimeStats);

      results = [
        {
          project_hash: data.project_hash,
          project_name: project?.title || 'Неизвестный проект',
          contributor_hash: contributorHash,
          total_committed_hours: timeStats.total_committed_hours,
          total_uncommitted_hours: timeStats.total_uncommitted_hours,
          available_hours: timeStats.available_hours,
          pending_hours: timeStats.pending_hours,
        },
      ];
    } else if (contributorHash) {
      // Все проекты для одного вкладчика
      const projectsWithTime = await this.timeEntryRepository.findProjectsByContributor(contributorHash);

      const projectStatsPromises = projectsWithTime.map(async (projectInfo) => {
        const project = await this.projectRepository.findByHash(projectInfo.project_hash);
        const basicTimeStats = await this.timeEntryRepository.getContributorProjectStats(
          contributorHash,
          projectInfo.project_hash
        );
        const timeStats = await this.calculateDetailedProjectStats(
          contributorHash,
          projectInfo.project_hash,
          basicTimeStats
        );

        return {
          project_hash: projectInfo.project_hash,
          project_name: project?.title || 'Неизвестный проект',
          contributor_hash: contributorHash,
          total_committed_hours: timeStats.total_committed_hours,
          total_uncommitted_hours: timeStats.total_uncommitted_hours,
          available_hours: timeStats.available_hours,
          pending_hours: timeStats.pending_hours,
        };
      });
      results = await Promise.all(projectStatsPromises);
    } else if (data.project_hash) {
      // Все вкладчики для одного проекта
      const contributorsWithTime = await this.timeEntryRepository.findContributorsByProject(data.project_hash);
      const project = await this.projectRepository.findByHash(data.project_hash);

      const contributorStatsPromises = contributorsWithTime.map(async (contributorInfo) => {
        const basicTimeStats = await this.timeEntryRepository.getContributorProjectStats(
          contributorInfo.contributor_hash,
          data.project_hash as string
        );
        const timeStats = await this.calculateDetailedProjectStats(
          contributorInfo.contributor_hash,
          data.project_hash as string,
          basicTimeStats
        );

        return {
          project_hash: data.project_hash as string,
          project_name: project?.title || 'Неизвестный проект',
          contributor_hash: contributorInfo.contributor_hash as string,
          total_committed_hours: timeStats.total_committed_hours,
          total_uncommitted_hours: timeStats.total_uncommitted_hours,
          available_hours: timeStats.available_hours,
          pending_hours: timeStats.pending_hours,
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
              const basicTimeStats = await this.timeEntryRepository.getContributorProjectStats(
                contributorInfo.contributor_hash,
                project.project_hash
              );
              const timeStats = await this.calculateDetailedProjectStats(
                contributorInfo.contributor_hash,
                project.project_hash,
                basicTimeStats
              );

              return {
                project_hash: project.project_hash,
                project_name: project.title || 'Неизвестный проект',
                contributor_hash: contributorInfo.contributor_hash,
                total_committed_hours: timeStats.total_committed_hours,
                total_uncommitted_hours: timeStats.total_uncommitted_hours,
                available_hours: timeStats.available_hours,
                pending_hours: timeStats.pending_hours,
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

  /**
   * Основная логика учёта времени - выполняется периодически
   */
  async trackTime(): Promise<void> {
    this.logger.debug('Запуск учёта времени...');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Получаем всех активных вкладчиков
    const activeContributors = await this.getAllActiveContributors();

    for (const contributor of activeContributors) {
      try {
        await this.trackTimeForContributor(contributor, today);
      } catch (error) {
        this.logger.error(`Ошибка учёта времени для вкладчика ${contributor.username}:`, (error as Error).stack);
      }
    }

    this.logger.debug('Учёт времени завершён');
  }

  /**
   * Получить всех активных вкладчиков из всех кооперативов
   */
  private async getAllActiveContributors(): Promise<ContributorDomainEntity[]> {
    // Получаем все проекты, чтобы узнать кооперативы
    const projects = await this.projectRepository.findAll();
    const coopnames = [...new Set(projects.map((p) => p.coopname).filter(Boolean))];

    const allContributors: ContributorDomainEntity[] = [];
    for (const coopname of coopnames) {
      try {
        const contributors = await this.contributorRepository.findByStatusAndCoopname(
          ContributorStatus.ACTIVE,
          coopname as string
        );
        allContributors.push(...contributors);
      } catch (error) {
        this.logger.error(`Ошибка получения вкладчиков для кооператива ${coopname}:`, (error as Error).stack);
      }
    }

    return allContributors;
  }

  /**
   * Учёт времени для конкретного вкладчика
   */
  private async trackTimeForContributor(contributor: ContributorDomainEntity, date: string): Promise<void> {
    // Получаем все активные задачи вкладчика
    const activeIssues = await this.getContributorActiveIssues(contributor);
    this.logger.debug(`Учёт времени для вкладчика ${contributor.username} за дату ${date}`);
    if (activeIssues.length === 0) {
      return;
    }

    // Рассчитываем время на каждую задачу вкладчика
    const hoursPerIssue = await this.calculateTimeDistributionPerIssue(contributor, activeIssues, date);
    this.logger.debug(
      `Рассчитанное время на каждую задачу из ${activeIssues.length} задач для вкладчика ${
        contributor.username
      } за дату ${date}: ${JSON.stringify(hoursPerIssue)}`
    );
    // Создаём записи времени для каждой задачи
    for (const issue of activeIssues) {
      const hours = hoursPerIssue[issue.issue_hash] || 0;
      if (hours <= 0) continue;

      // Проверяем, есть ли уже запись за сегодня для этой задачи
      const existingEntries = await this.timeEntryRepository.findByContributorAndDate(contributor.contributor_hash, date);
      const todayEntry = existingEntries.find((entry) => entry.issue_hash === issue.issue_hash && !entry.is_committed);
      if (todayEntry) {
        // Обновляем существующую запись
        todayEntry.hours += hours;
        await this.timeEntryRepository.update(todayEntry);
      } else {
        // Создаём новую запись
        const timeEntry = new TimeEntryDomainEntity({
          _id: '',
          contributor_hash: contributor.contributor_hash,
          issue_hash: issue.issue_hash,
          project_hash: issue.project_hash,
          coopname: contributor.coopname as string,
          date,
          hours,
          is_committed: false,
          block_num: 0,
          present: false,
          status: 'active',
        });
        await this.timeEntryRepository.create(timeEntry);
      }
    }
  }

  /**
   * Получить все активные задачи вкладчика
   */
  private async getContributorActiveIssues(contributor: ContributorDomainEntity): Promise<any[]> {
    // Получаем все активные задачи, где вкладчик является создателем
    return await this.issueRepository.findByStatusAndCreators(IssueStatus.IN_PROGRESS, [contributor.username]);
  }

  /**
   * Расчёт распределения времени между задачами вкладчика
   * Основная логика: равномерное распределение времени между активными задачами, но не более hours_per_day часов в день на вкладчика
   */
  private async calculateTimeDistributionPerIssue(
    contributor: ContributorDomainEntity,
    activeIssues: IssueDomainEntity[],
    date: string
  ): Promise<Record<string, number>> {
    // в дев режиме нет ограничения на количество часов в день
    const HOURS_PER_DAY = config.env === 'development' ? 100000 : Number(contributor.hours_per_day || 0);
    const HOURS_PER_HOUR = 1; // Каждый час добавляем 1 час работы

    const distribution: Record<string, number> = {};

    if (activeIssues.length === 0) {
      return distribution;
    }

    // Проверяем, сколько времени уже наработано вкладчиком за сегодня
    const existingEntries = await this.timeEntryRepository.findByContributorAndDate(contributor.contributor_hash, date);
    const totalExistingHours = existingEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Проверяем лимит на день
    if (totalExistingHours >= HOURS_PER_DAY) {
      return distribution; // Уже отработал лимит часов
    }

    // Распределяем время равномерно между активными задачами
    const availableHours = HOURS_PER_DAY - totalExistingHours;
    const hoursToDistribute = Math.min(HOURS_PER_HOUR, availableHours);
    const hoursPerIssue = hoursToDistribute / activeIssues.length;

    for (const issue of activeIssues) {
      distribution[issue.issue_hash] = hoursPerIssue;
    }

    return distribution;
  }

  /**
   * Получить статистику времени для вкладчика по проекту
   */
  async getContributorProjectStats(contributorHash: string, projectHash: string) {
    const basicStats = await this.timeEntryRepository.getContributorProjectStats(contributorHash, projectHash);
    return await this.calculateDetailedProjectStats(contributorHash, projectHash, basicStats);
  }

  /**
   * Зафиксировать время в коммите (отметить записи как закоммиченные, только по завершённым задачам)
   */
  async commitTime(contributorHash: string, projectHash: string, hours: number, commitHash: string): Promise<void> {
    // Получаем незакоммиченные записи времени для этого проекта
    const uncommittedEntries = await this.timeEntryRepository.findUncommittedByProjectAndContributor(
      projectHash,
      contributorHash
    );

    if (uncommittedEntries.length === 0) {
      throw new Error('Не найдено незакоммиченных записей времени');
    }

    // Получаем contributor по hash, чтобы получить username
    const contributor = await this.contributorRepository.findOne({ contributor_hash: contributorHash });
    if (!contributor) {
      throw new Error(`Вкладчик с хэшем ${contributorHash} не найден`);
    }

    // Получаем завершённые задачи вкладчика в этом проекте
    const completedIssues = await this.issueRepository.findCompletedByProjectAndCreators(projectHash, [
      contributor.username,
    ]);

    // Получаем хеши завершённых задач
    const completedIssueHashes = completedIssues.map((issue) => issue.issue_hash);

    // Фильтруем записи времени только по завершённым задачам
    const availableEntries = uncommittedEntries.filter((entry) => completedIssueHashes.includes(entry.issue_hash));

    if (availableEntries.length === 0) {
      throw new Error('Не найдено незакоммиченных записей времени для завершенных задач');
    }

    // Сортируем по дате (старые сначала)
    availableEntries.sort((a, b) => a.date.localeCompare(b.date));

    let remainingHours = hours;
    const entriesToCommit: TimeEntryDomainEntity[] = [];

    for (const entry of availableEntries) {
      if (remainingHours <= 0) break;

      if (entry.hours <= remainingHours) {
        // Коммитим всю запись
        entriesToCommit.push(entry);
        remainingHours -= entry.hours;
      } else {
        // Коммитим часть записи - создаём новую запись с оставшимся временем
        const committedEntry = new TimeEntryDomainEntity({
          _id: '',
          contributor_hash: entry.contributor_hash,
          issue_hash: entry.issue_hash,
          project_hash: entry.project_hash,
          coopname: entry.coopname,
          date: entry.date,
          hours: remainingHours,
          commit_hash: commitHash,
          is_committed: true,
          block_num: entry.block_num,
          present: entry.present,
          status: entry.status,
          _created_at: entry._created_at,
          _updated_at: new Date(),
        });

        await this.timeEntryRepository.create(committedEntry);

        // Обновляем оригинальную запись
        entry.hours -= remainingHours;
        await this.timeEntryRepository.update(entry);

        remainingHours = 0;
      }
    }

    if (entriesToCommit.length > 0) {
      await this.timeEntryRepository.commitTimeEntries(entriesToCommit, commitHash);
    }

    if (remainingHours > 0) {
      throw new Error(
        `Недостаточно незакоммиченных часов для завершенных задач. Требуется: ${hours}, доступно: ${hours - remainingHours}`
      );
    }
  }

  /**
   * Рассчитать детальную статистику проекта с учётом статуса задач
   */
  private async calculateDetailedProjectStats(
    contributorHash: string,
    projectHash: string,
    basicStats: ContributorProjectBasicTimeStatsDomainInterface
  ): Promise<ContributorProjectTimeStatsDomainInterface> {
    // Получаем все незакоммиченные записи времени по проекту и вкладчику
    const uncommittedEntries = await this.timeEntryRepository.findUncommittedByProjectAndContributor(
      projectHash,
      contributorHash
    );

    // Получаем contributor по hash, чтобы получить username
    const contributor = await this.contributorRepository.findOne({ contributor_hash: contributorHash });
    if (!contributor) {
      throw new Error(`Вкладчик с хэшем ${contributorHash} не найден`);
    }

    // Получаем завершённые задачи вкладчика в этом проекте
    const completedIssues = await this.issueRepository.findCompletedByProjectAndCreators(projectHash, [
      contributor.username,
    ]);

    // Получаем хеши завершённых задач
    const completedIssueHashes = completedIssues.map((issue) => issue.issue_hash);

    // Рассчитываем доступное время (по завершённым задачам)
    const availableEntries = uncommittedEntries.filter((entry) => completedIssueHashes.includes(entry.issue_hash));
    const available_hours = availableEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Рассчитываем время в ожидании (по незавершённым задачам)
    const pendingEntries = uncommittedEntries.filter((entry) => !completedIssueHashes.includes(entry.issue_hash));
    const pending_hours = pendingEntries.reduce((sum, entry) => sum + entry.hours, 0);

    return {
      total_committed_hours: basicStats.total_committed_hours,
      total_uncommitted_hours: basicStats.total_uncommitted_hours,
      available_hours,
      pending_hours,
    };
  }

  /**
   * Получить доступное время для коммита (только по завершённым задачам)
   */
  async getAvailableCommitHours(contributorHash: string, projectHash: string): Promise<number> {
    // Получаем базовую статистику
    const basicStats = await this.timeEntryRepository.getContributorProjectStats(contributorHash, projectHash);

    // Рассчитываем детальную статистику
    const detailedStats = await this.calculateDetailedProjectStats(contributorHash, projectHash, basicStats);

    return detailedStats.available_hours; // Без ограничения - можно использовать всё накопленное время по завершённым задачам
  }

  /**
   * Получить агрегированные записи времени по задачам с пагинацией
   */
  async getTimeEntriesByIssues(
    data: GetTimeEntriesDomainInput,
    options?: PaginationInputDomainInterface
  ): Promise<TimeEntriesByIssuesResultDomainInterface> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    // Если передан username, находим contributor_hash
    let contributorHash = data.contributor_hash;
    if (data.username && !contributorHash) {
      const contributor = await this.contributorRepository.findByUsernameAndCoopname(data.username, data.coopname || '');
      if (contributor) {
        contributorHash = contributor.contributor_hash;
      } else {
        // Если contributor не найден, возвращаем пустой результат
        return {
          items: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
        };
      }
    }

    // Получаем агрегированные данные из репозитория
    const aggregatedData = await this.timeEntryRepository.getAggregatedTimeEntriesByIssues(
      {
        projectHash: data.project_hash,
        contributorHash: contributorHash,
        isCommitted: data.is_committed,
        coopname: data.coopname,
      },
      limit,
      offset
    );

    // Получаем общее количество для пагинации
    const totalCount = await this.timeEntryRepository.getAggregatedTimeEntriesCount({
      projectHash: data.project_hash,
      contributorHash: contributorHash,
      isCommitted: data.is_committed,
      coopname: data.coopname,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: aggregatedData,
      totalCount,
      currentPage: page,
      totalPages,
    };
  }
}
