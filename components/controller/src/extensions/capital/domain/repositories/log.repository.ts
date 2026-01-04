import { LogDomainEntity } from '../entities/log.entity';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { LogEventType } from '../enums/log-event-type.enum';

/**
 * Интерфейс фильтрации логов
 */
export interface ILogFilterInput {
  /** Название кооператива */
  coopname?: string;

  /** Хеш проекта или компонента */
  project_hash?: string;

  /** Типы событий для фильтрации */
  event_types?: LogEventType[];

  /** Инициатор действия */
  initiator?: string;

  /** Период с */
  date_from?: Date;

  /** Период по */
  date_to?: Date;
}

/**
 * Интерфейс репозитория логов
 */
export interface LogRepository {
  /**
   * Создание новой записи лога
   */
  create(log: Omit<LogDomainEntity, '_id' | 'created_at'>): Promise<LogDomainEntity>;

  /**
   * Поиск лога по ID
   */
  findById(id: string): Promise<LogDomainEntity | null>;

  /**
   * Получение всех логов с фильтрацией и пагинацией
   */
  findAll(
    filter?: ILogFilterInput,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>>;

  /**
   * Получение логов по хешу проекта
   */
  findByProjectHash(
    projectHash: string,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>>;

  /**
   * Получение логов по инициатору
   */
  findByInitiator(
    initiator: string,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>>;

  /**
   * Удаление лога
   */
  delete(id: string): Promise<void>;
}

export const LOG_REPOSITORY = Symbol('LogRepository');
