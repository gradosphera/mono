/** Происхождение текста в истории: обычное сообщение или голосовое (распознано Whisper). */
export enum ChatcoopRoomMessageKind {
  TEXT = 'text',
  AUDIO = 'audio',
  /** Whisper не смог (после ретраев); строка-заглушка в PG, чтобы не долбить API */
  AUDIO_STT_FAIL = 'audio_stt_fail',
}

export interface RoomMessageHistoryDomainEntity {
  id: string;
  matrixRoomId: string;
  matrixEventId: string;
  callTranscriptionId: string | null;
  livekitRoomName: string | null;
  senderMatrixUserId: string;
  senderDisplayName: string | null;
  /** Логин пайщика в кооперативе из `matrix_users`, если связь есть */
  coopUsername: string | null;
  messageKind: ChatcoopRoomMessageKind;
  /** Для `audio` — результат Whisper; сырое аудио не храним */
  bodyText: string;
  originServerTs: number;
  createdAt: Date;
  updatedAt: Date;
}
