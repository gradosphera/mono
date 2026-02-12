import { TranscriptionSegmentDomainEntity } from '../entities/transcription-segment.entity';

// Порт репозитория для сегментов транскрипции
export interface TranscriptionSegmentRepository {
  create(data: Omit<TranscriptionSegmentDomainEntity, 'id' | 'createdAt'>): Promise<TranscriptionSegmentDomainEntity>;
  findByTranscriptionId(transcriptionId: string): Promise<TranscriptionSegmentDomainEntity[]>;
  findById(id: string): Promise<TranscriptionSegmentDomainEntity | null>;
  createMany(
    data: Omit<TranscriptionSegmentDomainEntity, 'id' | 'createdAt'>[]
  ): Promise<TranscriptionSegmentDomainEntity[]>;
}

export const TRANSCRIPTION_SEGMENT_REPOSITORY = Symbol('TranscriptionSegmentRepository');
