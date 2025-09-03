import type { ActionDomainInterface } from '../interfaces/action-domain.interface';
import type { DeltaDomainInterface } from '../interfaces/delta-domain.interface';
import type {
  ActionFilterDomainInterface,
  DeltaFilterDomainInterface,
  PaginatedResultDomainInterface,
} from '../interfaces/parser-config-domain.interface';

/**
 * Порт для репозитория действий блокчейна
 */
export interface ActionRepositoryPort {
  /**
   * Сохранение действия
   */
  save(action: Omit<ActionDomainInterface, 'id' | 'created_at'>): Promise<ActionDomainInterface>;

  /**
   * Получение действий с фильтрацией и пагинацией
   */
  findMany(
    filter: ActionFilterDomainInterface,
    page: number,
    limit: number
  ): Promise<PaginatedResultDomainInterface<ActionDomainInterface>>;

  /**
   * Получение действия по ID
   */
  findById(id: string): Promise<ActionDomainInterface | null>;

  /**
   * Удаление действий после указанного блока
   */
  deleteAfterBlock(blockNum: number): Promise<void>;

  /**
   * Получение общего количества действий
   */
  count(): Promise<number>;

  /**
   * Получение последнего действия по номеру блока
   */
  findLastByBlock(): Promise<ActionDomainInterface | null>;
}

/**
 * Порт для репозитория дельт блокчейна
 */
export interface DeltaRepositoryPort {
  /**
   * Сохранение дельты
   */
  save(delta: Omit<DeltaDomainInterface, 'id' | 'created_at'>): Promise<DeltaDomainInterface>;

  /**
   * Получение дельт с фильтрацией и пагинацией
   */
  findMany(
    filter: DeltaFilterDomainInterface,
    page: number,
    limit: number
  ): Promise<PaginatedResultDomainInterface<DeltaDomainInterface>>;

  /**
   * Получение дельты по ID
   */
  findById(id: string): Promise<DeltaDomainInterface | null>;

  /**
   * Удаление дельт после указанного блока
   */
  deleteAfterBlock(blockNum: number): Promise<void>;

  /**
   * Получение общего количества дельт
   */
  count(): Promise<number>;

  /**
   * Получение последней дельты по номеру блока
   */
  findLastByBlock(): Promise<DeltaDomainInterface | null>;
}

/**
 * Порт для сервиса синхронизации состояния парсера
 */
export interface SyncStateRepositoryPort {
  /**
   * Получение текущего блока синхронизации
   */
  getCurrentBlock(): Promise<number>;

  /**
   * Обновление текущего блока синхронизации
   */
  updateCurrentBlock(blockNum: number): Promise<void>;
}

// Экспорт символов для внедрения зависимостей
export const ACTION_REPOSITORY_PORT = Symbol('ActionRepositoryPort');
export const DELTA_REPOSITORY_PORT = Symbol('DeltaRepositoryPort');
export const SYNC_STATE_REPOSITORY_PORT = Symbol('SyncStateRepositoryPort');
