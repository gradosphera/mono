import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as cron from 'node-cron';
import { TimeTrackingInteractor } from '../use-cases/time-tracking.interactor';
import { TimeEntryDomainEntity } from '../../domain/entities/time-entry.entity';
import { TimeEntryRepository, TIME_ENTRY_REPOSITORY } from '../../domain/repositories/time-entry.repository';
import { ContributorRepository, CONTRIBUTOR_REPOSITORY } from '../../domain/repositories/contributor.repository';
import { IssueRepository, ISSUE_REPOSITORY } from '../../domain/repositories/issue.repository';
import { ProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository';
import { IssueStatus } from '../../domain/enums/issue-status.enum';
import type { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorStatus } from '../../domain/enums/contributor-status.enum';
import type { ContributorProjectsTimeStatsInputDTO } from '../dto/time_tracker/project-time-stats.dto';
import type { ContributorProjectsTimeStatsOutputDTO } from '../dto/time_tracker/project-time-stats.dto';
import type { TimeStatsInputDTO } from '../dto/time_tracker/flexible-time-stats.dto';
import type { FlexibleTimeStatsOutputDTO } from '../dto/time_tracker/flexible-time-stats.dto';
import type { TimeEntryOutputDTO } from '../dto/time_tracker/time-entries.dto';
import type { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { TimeEntriesFilterInputDTO } from '../dto/time_tracker';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

/**
 * Сервис для автоматического учёта и распределения времени работы над задачами
 */
@Injectable()
export class TimeTrackingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TimeTrackingService.name);
  private cronJob: cron.ScheduledTask | null = null;

  constructor(
    private readonly timeTrackingInteractor: TimeTrackingInteractor,
    @Inject(TIME_ENTRY_REPOSITORY)
    private readonly timeEntryRepository: TimeEntryRepository,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
    @Inject(ISSUE_REPOSITORY)
    private readonly issueRepository: IssueRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository
  ) {}

  /**
   * Инициализация сервиса при старте модуля
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Инициализация сервиса учёта времени...');

    // Запускаем учёт времени каждый час
    this.cronJob = cron.schedule('0 * * * *', async () => {
      try {
        await this.trackTime();
      } catch (error) {
        this.logger.error('Ошибка в задаче учёта времени по расписанию', error);
      }
    });

    // Также выполняем первичный учёт времени при запуске
    try {
      await this.trackTime();
    } catch (error) {
      this.logger.warn(
        'Первичный учёт времени не удался, будет повторена попытка при следующем запуске по расписанию',
        error
      );
    }

    this.logger.log('Сервис учёта времени успешно инициализирован');
  }

  /**
   * Остановка сервиса
   */
  async stop(): Promise<void> {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.logger.log('Сервис учёта времени остановлен');
    }
  }

  onModuleDestroy() {
    return this.stop();
  }

  /**
   * Основная логика учёта времени - выполняется периодически
   */
  private async trackTime(): Promise<void> {
    this.logger.debug('Запуск учёта времени...');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Получаем всех активных вкладчиков
    const activeContributors = await this.getAllActiveContributors();

    for (const contributor of activeContributors) {
      try {
        await this.trackTimeForContributor(contributor, today);
      } catch (error) {
        this.logger.error(`Ошибка учёта времени для вкладчика ${contributor.username}:`, error);
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
        this.logger.error(`Ошибка получения вкладчиков для кооператива ${coopname}:`, error);
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

    if (activeIssues.length === 0) {
      return;
    }

    // Рассчитываем время на каждую задачу вкладчика
    const hoursPerIssue = await this.calculateTimeDistributionPerIssue(contributor, activeIssues, date);

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
          present: true,
          status: 'active',
          _created_at: new Date(),
          _updated_at: new Date(),
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
    return await this.issueRepository.findByStatusAndCreatorsHashs(IssueStatus.IN_PROGRESS, [contributor.contributor_hash]);
  }

  /**
   * Расчёт распределения времени между задачами вкладчика
   * Основная логика: равномерное распределение времени между активными задачами, но не более 8 часов в день на вкладчика
   */
  private async calculateTimeDistributionPerIssue(
    contributor: ContributorDomainEntity,
    activeIssues: any[],
    date: string
  ): Promise<Record<string, number>> {
    const HOURS_PER_DAY = 8;
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
      return distribution; // Уже отработал 8 часов
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
    return await this.timeEntryRepository.getContributorProjectStats(contributorHash, projectHash);
  }

  /**
   * Зафиксировать время в коммите (отметить записи как закоммиченные)
   */
  async commitTime(contributorHash: string, projectHash: string, hours: number, commitHash: string): Promise<void> {
    // Получаем незакоммиченные записи времени для этого проекта
    const uncommittedEntries = await this.timeEntryRepository.findUncommittedByProjectAndContributor(
      projectHash,
      contributorHash
    );

    if (uncommittedEntries.length === 0) {
      throw new Error('No uncommitted time entries found');
    }

    // Сортируем по дате (старые сначала)
    uncommittedEntries.sort((a, b) => a.date.localeCompare(b.date));

    let remainingHours = hours;
    const entriesToCommit: TimeEntryDomainEntity[] = [];

    for (const entry of uncommittedEntries) {
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
      throw new Error(`Not enough uncommitted hours. Required: ${hours}, available: ${hours - remainingHours}`);
    }
  }

  /**
   * Получить доступное время для коммита
   */
  async getAvailableCommitHours(contributorHash: string, projectHash: string): Promise<number> {
    const stats = await this.getContributorProjectStats(contributorHash, projectHash);
    return Math.min(stats.available_hours, 8); // Ограничиваем 8 часами
  }

  /**
   * Получить статистику времени для вкладчика по проекту (DTO версия)
   */
  async getTimeStats(contributorHash: string, projectHash: string) {
    const domainResult = await this.timeTrackingInteractor.getTimeStats({
      contributor_hash: contributorHash,
      project_hash: projectHash,
    });

    return {
      contributor_hash: domainResult.contributor_hash,
      project_hash: domainResult.project_hash,
      total_committed_hours: domainResult.total_committed_hours,
      total_uncommitted_hours: domainResult.total_uncommitted_hours,
      available_hours: domainResult.available_hours,
    };
  }

  /**
   * Получить список проектов с статистикой времени для вкладчика
   */
  async getContributorProjectsTimeStats(
    data: ContributorProjectsTimeStatsInputDTO
  ): Promise<ContributorProjectsTimeStatsOutputDTO> {
    const domainResult = await this.timeTrackingInteractor.getContributorProjectsTimeStats({
      contributor_hash: data.contributor_hash,
    });

    return {
      contributor_hash: domainResult.contributor_hash,
      projects: domainResult.projects.map((project) => ({
        project_hash: project.project_hash,
        project_name: project.project_name,
        contributor_hash: project.contributor_hash,
        total_committed_hours: project.total_committed_hours,
        total_uncommitted_hours: project.total_uncommitted_hours,
        available_hours: project.available_hours,
      })),
    };
  }

  /**
   * Получить пагинированные записи времени по проекту
   */
  async getTimeEntriesByProject(
    filter: TimeEntriesFilterInputDTO,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<TimeEntryOutputDTO>> {
    // Конвертируем PaginationInputDTO в PaginationInputDomainInterface
    const domainOptions: PaginationInputDomainInterface | undefined = options
      ? {
          page: options.page,
          limit: options.limit,
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        }
      : undefined;

    const domainResult = await this.timeTrackingInteractor.getTimeEntries(
      {
        project_hash: filter.project_hash,
        contributor_hash: filter.contributor_hash,
        is_committed: filter.is_committed,
        coopname: filter.coopname,
      },
      domainOptions
    );

    return {
      items: domainResult.items.map(this.mapTimeEntryToDTO),
      totalCount: domainResult.totalCount,
      currentPage: domainResult.currentPage,
      totalPages: domainResult.totalPages,
    };
  }

  /**
   * Гибкий запрос статистики времени с пагинацией
   */
  async getFlexibleTimeStats(
    data: TimeStatsInputDTO,
    options?: PaginationInputDTO
  ): Promise<FlexibleTimeStatsOutputDTO> {
    // Конвертируем PaginationInputDTO в PaginationInputDomainInterface
    const domainOptions: PaginationInputDomainInterface | undefined = options
      ? {
          page: options.page,
          limit: options.limit,
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        }
      : undefined;

    const domainResult = await this.timeTrackingInteractor.getFlexibleTimeStats(
      {
        contributor_hash: data.contributor_hash,
        project_hash: data.project_hash,
        coopname: data.coopname,
      },
      domainOptions
    );

    return {
      items: domainResult.items,
      totalCount: domainResult.totalCount,
      currentPage: domainResult.currentPage,
      totalPages: domainResult.totalPages,
    };
  }

  /**
   * Преобразование доменной сущности TimeEntry в DTO
   */
  private mapTimeEntryToDTO(entity: TimeEntryDomainEntity): TimeEntryOutputDTO {
    return {
      _id: entity._id,
      contributor_hash: entity.contributor_hash,
      issue_hash: entity.issue_hash,
      project_hash: entity.project_hash,
      coopname: entity.coopname,
      date: entity.date,
      hours: entity.hours,
      commit_hash: entity.commit_hash,
      is_committed: entity.is_committed,
      _created_at: entity._created_at.toISOString(),
      _updated_at: entity._updated_at.toISOString(),
    };
  }
}
