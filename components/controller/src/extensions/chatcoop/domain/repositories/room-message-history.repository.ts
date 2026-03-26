import { RoomMessageHistoryDomainEntity } from '../entities/room-message-history.entity';

export type RoomMessageHistoryInsertInput = Omit<
  RoomMessageHistoryDomainEntity,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface RoomMessageHistoryRepository {
  /**
   * Вставка строки; при дубликате (matrix_room_id, matrix_event_id) — без ошибки, возвращает false.
   */
  insertIgnoreDuplicate(row: RoomMessageHistoryInsertInput): Promise<boolean>;
}

export const ROOM_MESSAGE_HISTORY_REPOSITORY = Symbol('RoomMessageHistoryRepository');
