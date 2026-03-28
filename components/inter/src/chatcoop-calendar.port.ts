/**
 * Read-модель события календаря ChatCoop для межмодульного контракта (Capital и др.).
 * Без Nest/TypeORM — только plain-типы.
 */
export interface InterCalendarEventWindow {
  /** ISO 8601 */
  fromInclusive: string;
  /** ISO 8601 */
  toExclusive: string;
}

export interface InterCoopCalendarEventRead {
  id: string;
  matrixRoomId: string;
  /** Из реестра управляемых комнат; null если комната не в реестре */
  projectHash: string | null;
  title: string;
  description: string | null;
  startsAtIso: string;
  endsAtIso: string | null;
  createdByUsername: string;
  icsSequence: number;
}

/**
 * Порт: чтение событий календаря по комнатам проекта Capital и опционально по окну времени.
 * Реализация — расширение chatcoop; регистрация через InterCommunicationBridgeModule.
 */
export interface InterChatCoopCalendarPort {
  listEventsByProjectHash(input: {
    projectHash: string;
    window?: InterCalendarEventWindow;
  }): Promise<InterCoopCalendarEventRead[]>;
}
