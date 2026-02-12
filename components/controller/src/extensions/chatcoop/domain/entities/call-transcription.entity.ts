// Доменная сущность транскрипции звонка
// Представляет запись о звонке с транскрипцией

export enum TranscriptionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface CallTranscriptionDomainEntity {
  id: string;
  roomId: string; // LiveKit room name
  matrixRoomId: string; // Matrix room ID (для сопоставления)
  roomName: string; // Человекочитаемое имя комнаты
  startedAt: Date;
  endedAt: Date | null;
  participants: string[]; // Массив identity участников
  status: TranscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}
