import { CallTranscriptionDomainEntity } from '../entities/call-transcription.entity';

// Порт репозитория для транскрипций звонков
export interface CallTranscriptionRepository {
  create(
    data: Omit<CallTranscriptionDomainEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CallTranscriptionDomainEntity>;
  findById(id: string): Promise<CallTranscriptionDomainEntity | null>;
  findByRoomId(roomId: string): Promise<CallTranscriptionDomainEntity | null>;
  findByMatrixRoomId(matrixRoomId: string): Promise<CallTranscriptionDomainEntity[]>;
  findActiveByRoomId(roomId: string): Promise<CallTranscriptionDomainEntity | null>;
  update(id: string, data: Partial<CallTranscriptionDomainEntity>): Promise<CallTranscriptionDomainEntity>;
  findAll(options?: { limit?: number; offset?: number }): Promise<CallTranscriptionDomainEntity[]>;
  findByParticipant(speakerIdentity: string): Promise<CallTranscriptionDomainEntity[]>;
}

export const CALL_TRANSCRIPTION_REPOSITORY = Symbol('CallTranscriptionRepository');
