import type { ActionDomainInterface } from '../interfaces/action-domain.interface';
import type {
  ActionFilterDomainInterface,
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

// Экспорт символа для внедрения зависимостей
export const ACTION_REPOSITORY_PORT = Symbol('ActionRepositoryPort');
