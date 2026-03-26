import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RoomMessageHistoryRepository,
  RoomMessageHistoryInsertInput,
} from '../../domain/repositories/room-message-history.repository';
import { RoomMessageHistoryTypeormEntity } from '../entities/room-message-history.typeorm-entity';
import { RoomMessageHistoryMapper } from '../mappers/room-message-history.mapper';

@Injectable()
export class RoomMessageHistoryTypeormRepository implements RoomMessageHistoryRepository {
  constructor(
    @InjectRepository(RoomMessageHistoryTypeormEntity)
    private readonly repository: Repository<RoomMessageHistoryTypeormEntity>
  ) {}

  async insertIgnoreDuplicate(row: RoomMessageHistoryInsertInput): Promise<boolean> {
    const v = RoomMessageHistoryMapper.toInsertEntity(row);
    const result = (await this.repository.query(
      `
      INSERT INTO chatcoop_room_message_history (
        matrix_room_id, matrix_event_id, call_transcription_id, livekit_room_name,
        sender_matrix_user_id, sender_display_name, coop_username, message_kind, body_text, origin_server_ts
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (matrix_room_id, matrix_event_id) DO NOTHING
      RETURNING id
      `,
      [
        v.matrixRoomId,
        v.matrixEventId,
        v.callTranscriptionId,
        v.livekitRoomName,
        v.senderMatrixUserId,
        v.senderDisplayName,
        v.coopUsername,
        v.messageKind,
        v.bodyText,
        v.originServerTs,
      ]
    )) as { id: string }[];
    return Array.isArray(result) && result.length > 0;
  }
}
