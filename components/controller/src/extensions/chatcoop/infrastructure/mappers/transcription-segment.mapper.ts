import { TranscriptionSegmentDomainEntity } from '../../domain/entities/transcription-segment.entity';
import { TranscriptionSegmentTypeormEntity } from '../entities/transcription-segment.typeorm-entity';

// Маппер для преобразования между доменной сущностью и TypeORM-сущностью сегмента транскрипции
export class TranscriptionSegmentMapper {
  static toDomain(entity: TranscriptionSegmentTypeormEntity): TranscriptionSegmentDomainEntity {
    return {
      id: entity.id,
      transcriptionId: entity.transcriptionId,
      speakerIdentity: entity.speakerIdentity,
      speakerName: entity.speakerName,
      text: entity.text,
      startOffset: entity.startOffset,
      endOffset: entity.endOffset,
      createdAt: entity.createdAt,
    };
  }

  static toEntity(
    domain: Omit<TranscriptionSegmentDomainEntity, 'id' | 'createdAt'>
  ): Partial<TranscriptionSegmentTypeormEntity> {
    return {
      transcriptionId: domain.transcriptionId,
      speakerIdentity: domain.speakerIdentity,
      speakerName: domain.speakerName,
      text: domain.text,
      startOffset: domain.startOffset,
      endOffset: domain.endOffset,
    };
  }
}
