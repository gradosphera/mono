import { CallTranscriptionDomainEntity } from '../../domain/entities/call-transcription.entity';
import { CallTranscriptionTypeormEntity } from '../entities/call-transcription.typeorm-entity';

// Маппер для преобразования между доменной сущностью и TypeORM-сущностью транскрипции
export class CallTranscriptionMapper {
  static toDomain(entity: CallTranscriptionTypeormEntity): CallTranscriptionDomainEntity {
    return {
      id: entity.id,
      roomId: entity.roomId,
      matrixRoomId: entity.matrixRoomId,
      roomName: entity.roomName,
      startedAt: entity.startedAt,
      endedAt: entity.endedAt,
      participants: entity.participants,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toEntity(
    domain: Omit<CallTranscriptionDomainEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Partial<CallTranscriptionTypeormEntity> {
    return {
      roomId: domain.roomId,
      matrixRoomId: domain.matrixRoomId,
      roomName: domain.roomName,
      startedAt: domain.startedAt,
      endedAt: domain.endedAt,
      participants: domain.participants,
      status: domain.status,
    };
  }

  static toUpdateEntity(domain: Partial<CallTranscriptionDomainEntity>): Partial<CallTranscriptionTypeormEntity> {
    const update: Partial<CallTranscriptionTypeormEntity> = {};

    if (domain.roomId !== undefined) update.roomId = domain.roomId;
    if (domain.matrixRoomId !== undefined) update.matrixRoomId = domain.matrixRoomId;
    if (domain.roomName !== undefined) update.roomName = domain.roomName;
    if (domain.startedAt !== undefined) update.startedAt = domain.startedAt;
    if (domain.endedAt !== undefined) update.endedAt = domain.endedAt;
    if (domain.participants !== undefined) update.participants = domain.participants;
    if (domain.status !== undefined) update.status = domain.status;

    return update;
  }
}
