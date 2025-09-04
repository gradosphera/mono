import type { ForkDomainInterface } from '../interfaces/fork-domain.interface';

/**
 * Порт для репозитория форков блокчейна
 */
export interface ForkRepositoryPort {
  /**
   * Сохранение форка
   */
  save(fork: Omit<ForkDomainInterface, 'id' | 'created_at'>): Promise<ForkDomainInterface>;

  /**
   * Получение форка по ID
   */
  findById(id: string): Promise<ForkDomainInterface | null>;

  /**
   * Удаление форков после указанного блока
   */
  deleteAfterBlock(blockNum: number): Promise<void>;

  /**
   * Получение общего количества форков
   */
  count(): Promise<number>;

  /**
   * Получение последнего форка по номеру блока
   */
  findLastByBlock(): Promise<ForkDomainInterface | null>;
}

// Экспорт символа для внедрения зависимостей
export const FORK_REPOSITORY_PORT = Symbol('ForkRepositoryPort');
