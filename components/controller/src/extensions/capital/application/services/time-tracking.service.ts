import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { TimeEntryDomainEntity } from '../../domain/entities/time-entry.entity';
import { TimeEntryRepository, TIME_ENTRY_REPOSITORY } from '../../domain/repositories/time-entry.repository';
import { ContributorRepository, CONTRIBUTOR_REPOSITORY } from '../../domain/repositories/contributor.repository';
import { IssueRepository, ISSUE_REPOSITORY } from '../../domain/repositories/issue.repository';
import { ProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository';
import { IssueStatus } from '../../domain/enums/issue-status.enum';
import type { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorStatus } from '../../domain/enums/contributor-status.enum';

/**
 * Сервис для автоматического учёта и распределения времени работы над задачами
 */
@Injectable()
export class TimeTrackingService implements OnModuleInit {
  private readonly logger = new Logger(TimeTrackingService.name);
  private cronJob: cron.ScheduledTask | null = null;

  constructor(
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
    this.logger.log('Initializing TimeTrackingService...');

    // Запускаем учёт времени каждый час
    this.cronJob = cron.schedule('0 * * * *', async () => {
      try {
        await this.trackTime();
      } catch (error) {
        this.logger.error('Error in time tracking cron job', error);
      }
    });

    // Также выполняем первичный учёт времени при запуске
    try {
      await this.trackTime();
    } catch (error) {
      this.logger.warn('Initial time tracking failed, will retry on next cron run', error);
    }

    this.logger.log('TimeTrackingService initialized successfully');
  }

  /**
   * Остановка сервиса
   */
  async stop(): Promise<void> {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.logger.log('TimeTrackingService stopped');
    }
  }

  /**
   * Основная логика учёта времени - выполняется периодически
   */
  private async trackTime(): Promise<void> {
    this.logger.debug('Starting time tracking...');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Получаем всех активных вкладчиков
    const activeContributors = await this.getAllActiveContributors();

    for (const contributor of activeContributors) {
      try {
        await this.trackTimeForContributor(contributor, today);
      } catch (error) {
        this.logger.error(`Error tracking time for contributor ${contributor.username}:`, error);
      }
    }

    this.logger.debug('Time tracking completed');
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
        this.logger.error(`Error getting contributors for coop ${coopname}:`, error);
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
    const allActiveIssues = await this.issueRepository.findByStatus(IssueStatus.IN_PROGRESS);
    return allActiveIssues.filter((issue) => issue.creators_hashs.includes(contributor.contributor_hash));
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
    const stats = await this.getContributorProjectStats(contributorHash, projectHash);

    return {
      contributor_hash: contributorHash,
      project_hash: projectHash,
      total_committed_hours: stats.total_committed_hours,
      total_uncommitted_hours: stats.total_uncommitted_hours,
      available_hours: stats.available_hours,
    };
  }
}
