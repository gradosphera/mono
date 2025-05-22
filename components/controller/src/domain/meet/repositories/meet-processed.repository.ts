import type { MeetProcessedDomainEntity } from '../entities/meet-processed-domain.entity';

export interface MeetProcessedRepository {
  /**
   * Получить данные о завершенном собрании по хешу
   * @param hash Хеш собрания
   */
  findByHash(hash: string): Promise<MeetProcessedDomainEntity | null>;

  /**
   * Сохранить данные о завершенном собрании
   * @param data Данные о завершенном собрании
   */
  save(data: MeetProcessedDomainEntity): Promise<void>;
}

export const MEET_PROCESSED_REPOSITORY = Symbol('MeetProcessedRepository');
