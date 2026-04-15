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

  /** Есть ли уже строка для этого события Matrix (любой kind — текст, audio, AUDIO_STT_FAIL). */
  existsByMatrixRoomAndEventId(matrixRoomId: string, matrixEventId: string): Promise<boolean>;

  /** Уникальные UTC-дни YYYY-MM-DD, где есть сообщения с ts > after. */
  listDistinctUtcDatesWithNewMessagesAfter(
    matrixRoomId: string,
    afterOriginServerTsExclusive: number
  ): Promise<string[]>;

  /** Все сообщения комнаты за UTC-календарный день, по возрастанию времени. */
  listMessagesForRoomOnUtcDate(matrixRoomId: string, utcDate: string): Promise<RoomMessageHistoryDomainEntity[]>;

  getMaxOriginServerTsForRoom(matrixRoomId: string): Promise<number | null>;
}

export const ROOM_MESSAGE_HISTORY_REPOSITORY = Symbol('RoomMessageHistoryRepository');
