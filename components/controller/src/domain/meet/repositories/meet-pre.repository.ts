import type { MeetPreProcessingDomainEntity } from '../entities/meet-pre-domain.entity';

export interface MeetPreProcessingRepository {
  /**
   * Получить данные о проекте собрания по хешу
   * @param hash Хеш собрания
   */
  findByHash(hash: string): Promise<MeetPreProcessingDomainEntity | null>;

  /**
   * Создать новое собрание
   * @param data Данные нового собрания
   */
  create(data: MeetPreProcessingDomainEntity): Promise<void>;
}

export const MEET_PRE_PROCESSING_REPOSITORY = Symbol('MeetPreProcessingRepository');

// Для обратной совместимости
export interface MeetRepository extends MeetPreProcessingRepository {}
export const MEET_REPOSITORY = MEET_PRE_PROCESSING_REPOSITORY;
