import type { MeetPreProcessingDomainEntity } from '../entities/meet-pre-domain.entity';

export interface MeetRepository {
  /**
   * Получить данные о проекте решения по идентификатору
   * @param id Идентификатор проекта решения
   */
  findByHash(hash: string): Promise<MeetPreProcessingDomainEntity | null>;
  create(data: MeetPreProcessingDomainEntity);
}

export const MEET_REPOSITORY = Symbol('MeetRepository');
