/**
 * Отправка сообщений в Matrix (Client-Server API) от имени сервисной учётки.
 * Реализация — расширение ChatCoop; токен регистрируется в InterCommunicationBridgeModule.
 */
export interface InterMatrixSendTextAndPinInput {
  /** Matrix room id (!xxx:domain) */
  matrixRoomId: string;
  /** Текст m.room.message (msgtype m.text) */
  plainTextBody: string;
}

/** Текстовое сообщение без закрепа (закрепы — только для документов и т.п.). */
export type InterMatrixSendTextMessageInput = InterMatrixSendTextAndPinInput;

/** Редактирование корневого сообщения (m.replace → исходный event_id). */
export interface InterMatrixReplaceTextMessageInput {
  matrixRoomId: string;
  /** event_id исходного сообщения */
  rootEventId: string;
  plainTextBody: string;
}

/** Снятие закрепа и редaction корневого события (удаление анонса из мессенджера). */
export interface InterMatrixUnpinAndRedactAnnouncementInput {
  matrixRoomId: string;
  rootEventId: string;
}

export interface InterMatrixRoomMessagingPort {
  /**
   * Отправляет текстовое сообщение без закрепа.
   * @returns event_id отправленного сообщения
   */
  sendTextMessage(input: InterMatrixSendTextMessageInput): Promise<string>;

  /**
   * Отправляет текстовое сообщение и добавляет его в закрепления комнаты (m.room.pinned_events).
   * Новое событие добавляется в начало списка; дубликаты event_id убираются.
   * @returns event_id отправленного сообщения
   */
  sendTextMessageAndPin(input: InterMatrixSendTextAndPinInput): Promise<string>;

  /** Отправляет событие-замену (MSC2676) для обновления текста поста. */
  replaceTextMessage(input: InterMatrixReplaceTextMessageInput): Promise<void>;

  /** Убирает event_id из m.room.pinned_events и выполняет redact события. */
  unpinAndRedactAnnouncement(input: InterMatrixUnpinAndRedactAnnouncementInput): Promise<void>;
}
