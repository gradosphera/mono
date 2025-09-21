import { TimeEntryDomainEntity } from '../entities/time-entry.entity';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { TimeEntriesFilterDomainInterface } from '../interfaces/time-entries-filter-domain.interface';

/**
 * Репозиторий для работы с записями времени
 */
export interface TimeEntryRepository {
  /**
   * Создать запись времени
   */
  create(timeEntry: TimeEntryDomainEntity): Promise<TimeEntryDomainEntity>;

  /**
   * Найти записи времени по вкладчику и дате
   */
  findByContributorAndDate(contributorHash: string, date: string): Promise<TimeEntryDomainEntity[]>;

  /**
   * Найти незакоммиченные записи времени по вкладчику
   */
  findUncommittedByContributor(contributorHash: string): Promise<TimeEntryDomainEntity[]>;

  /**
   * Найти незакоммиченные записи времени по проекту и вкладчику
   */
  findUncommittedByProjectAndContributor(projectHash: string, contributorHash: string): Promise<TimeEntryDomainEntity[]>;

  /**
   * Обновить запись времени
   */
  update(timeEntry: TimeEntryDomainEntity): Promise<TimeEntryDomainEntity>;

  /**
   * Обновить несколько записей
   */
  updateMany(timeEntries: TimeEntryDomainEntity[]): Promise<void>;

  /**
   * Получить суммарное незакоммиченное время по вкладчику и проекту
   */
  getTotalUncommittedHours(contributorHash: string, projectHash: string): Promise<number>;

  /**
   * Получить статистику времени по вкладчику и проекту
   */
  getContributorProjectStats(
    contributorHash: string,
    projectHash: string
  ): Promise<{
    total_committed_hours: number;
    total_uncommitted_hours: number;
    available_hours: number;
  }>;

  /**
   * Поместить время в коммит (отметить как закоммиченное)
   */
  commitTimeEntries(entries: TimeEntryDomainEntity[], commitHash: string): Promise<void>;

  /**
   * Удалить запись времени
   */
  delete(id: string): Promise<void>;

  /**
   * Найти проекты с записями времени для вкладчика
   */
  findProjectsByContributor(contributorHash: string): Promise<{ project_hash: string; project_name?: string }[]>;

  /**
   * Найти вкладчиков с записями времени для проекта
   */
  findContributorsByProject(projectHash: string): Promise<{ contributor_hash: string }[]>;

  /**
   * Найти записи времени по проекту с пагинацией (projectHash опционален)
   */
  findByProjectWithPagination(
    filter: TimeEntriesFilterDomainInterface,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<TimeEntryDomainEntity>>;
}

export const TIME_ENTRY_REPOSITORY = Symbol('TIME_ENTRY_REPOSITORY');
