import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RoomMessageHistoryRepository,
  RoomMessageHistoryInsertInput,
} from '../../domain/repositories/room-message-history.repository';
import { RoomMessageHistoryTypeormEntity } from '../entities/room-message-history.typeorm-entity';
import { RoomMessageHistoryMapper } from '../mappers/room-message-history.mapper';
import type { RoomMessageHistoryDomainEntity } from '../../domain/entities/room-message-history.entity';

@Injectable()
export class RoomMessageHistoryTypeormRepository implements RoomMessageHistoryRepository {
  constructor(
    @InjectRepository(RoomMessageHistoryTypeormEntity)
    private readonly repository: Repository<RoomMessageHistoryTypeormEntity>
  ) {}

  async listDistinctUtcDatesWithNewMessagesAfter(
    matrixRoomId: string,
    afterOriginServerTsExclusive: number
  ): Promise<string[]> {
    const rows = await this.repository.query(
      `
      SELECT DISTINCT to_char(
        (to_timestamp(h.origin_server_ts / 1000.0) AT TIME ZONE 'UTC')::date,
        'YYYY-MM-DD'
      ) AS d
      FROM chatcoop_room_message_history h
      WHERE h.matrix_room_id = $1 AND h.origin_server_ts > $2
      ORDER BY d
      `,
      [matrixRoomId, String(afterOriginServerTsExclusive)]
    ) as { d: string }[];
    return rows.map((r) => r.d);
  }

  async listMessagesForRoomOnUtcDate(
    matrixRoomId: string,
    utcDate: string
  ): Promise<RoomMessageHistoryDomainEntity[]> {
    const entities = await this.repository
      .createQueryBuilder('h')
      .where('h.matrixRoomId = :matrixRoomId', { matrixRoomId })
      .andWhere(
        `to_char((to_timestamp(h.originServerTs / 1000.0) AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') = :utcDate`,
        { utcDate }
      )
      .orderBy('h.originServerTs', 'ASC')
      .getMany();
    return entities.map(RoomMessageHistoryMapper.toDomain);
  }

  async getMaxOriginServerTsForRoom(matrixRoomId: string): Promise<number | null> {
    const row = await this.repository
      .createQueryBuilder('h')
      .select('MAX(h.originServerTs)', 'm')
      .where('h.matrixRoomId = :matrixRoomId', { matrixRoomId })
      .getRawOne<{ m: string | null }>();
    if (row?.m == null || row.m === '') {
      return null;
    }
    return Number(row.m);
  }

  async existsByMatrixRoomAndEventId(matrixRoomId: string, matrixEventId: string): Promise<boolean> {
    const n = await this.repository
      .createQueryBuilder('h')
      .where('h.matrixRoomId = :matrixRoomId', { matrixRoomId })
      .andWhere('h.matrixEventId = :matrixEventId', { matrixEventId })
      .getCount();
    return n > 0;
  }

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
