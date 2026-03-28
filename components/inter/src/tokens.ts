/**
 * Nest DI: реализацию подставляет composition root (ExtensionsModule).
 */
export const INTER_PROJECT_COMMUNICATION_ARTIFACTS = Symbol.for(
  'InterProjectCommunicationArtifacts'
);

/** Matrix: отправка сообщений и закрепления (ChatCoop / MatrixApiService). */
export const INTER_MATRIX_ROOM_MESSAGING = Symbol.for('InterMatrixRoomMessaging');

/** ChatCoop: чтение событий календаря для Capital и др. */
export const INTER_CHATCOOP_CALENDAR = Symbol.for('InterChatCoopCalendar');
