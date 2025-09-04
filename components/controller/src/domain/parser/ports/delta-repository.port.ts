import type { DeltaDomainInterface } from '../interfaces/delta-domain.interface';
import type {
  DeltaFilterDomainInterface,
  PaginatedResultDomainInterface,
} from '../interfaces/parser-config-domain.interface';

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

// Экспорт символа для внедрения зависимостей
export const DELTA_REPOSITORY_PORT = Symbol('DeltaRepositoryPort');
