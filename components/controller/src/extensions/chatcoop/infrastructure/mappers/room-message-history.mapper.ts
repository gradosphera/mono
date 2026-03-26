import { RoomMessageHistoryDomainEntity } from '../../domain/entities/room-message-history.entity';
import type { RoomMessageHistoryInsertInput } from '../../domain/repositories/room-message-history.repository';
import { RoomMessageHistoryTypeormEntity } from '../entities/room-message-history.typeorm-entity';

export class RoomMessageHistoryMapper {
  static toDomain(entity: RoomMessageHistoryTypeormEntity): RoomMessageHistoryDomainEntity {
    return {
      id: entity.id,
      matrixRoomId: entity.matrixRoomId,
      matrixEventId: entity.matrixEventId,
      callTranscriptionId: entity.callTranscriptionId,
      livekitRoomName: entity.livekitRoomName,
      senderMatrixUserId: entity.senderMatrixUserId,
      senderDisplayName: entity.senderDisplayName,
      coopUsername: entity.coopUsername,
      messageKind: entity.messageKind,
      bodyText: entity.bodyText,
      originServerTs: entity.originServerTs,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toInsertEntity(
    row: RoomMessageHistoryInsertInput
  ): Omit<RoomMessageHistoryTypeormEntity, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      matrixRoomId: row.matrixRoomId,
      matrixEventId: row.matrixEventId,
      callTranscriptionId: row.callTranscriptionId,
      livekitRoomName: row.livekitRoomName,
      senderMatrixUserId: row.senderMatrixUserId,
      senderDisplayName: row.senderDisplayName,
      coopUsername: row.coopUsername,
      messageKind: row.messageKind,
      bodyText: row.bodyText,
      originServerTs: row.originServerTs,
    };
  }
}
