import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ChatcoopRoomMessageKind } from '../../domain/entities/room-message-history.entity';

@Entity('chatcoop_room_message_history')
@Index(['matrixRoomId', 'matrixEventId'], { unique: true })
@Index('IDX_chatcoop_room_msg_hist_room_ts', ['matrixRoomId', 'originServerTs'])
export class RoomMessageHistoryTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'matrix_room_id', type: 'varchar', length: 255 })
  matrixRoomId!: string;

  @Column({ name: 'matrix_event_id', type: 'varchar', length: 255 })
  matrixEventId!: string;

  @Column({ name: 'call_transcription_id', type: 'uuid', nullable: true })
  callTranscriptionId!: string | null;

  @Column({ name: 'livekit_room_name', type: 'varchar', length: 512, nullable: true })
  livekitRoomName!: string | null;

  @Column({ name: 'sender_matrix_user_id', type: 'varchar', length: 255 })
  senderMatrixUserId!: string;

  @Column({ name: 'sender_display_name', type: 'varchar', length: 500, nullable: true })
  senderDisplayName!: string | null;

  @Column({ name: 'coop_username', type: 'varchar', length: 255, nullable: true })
  coopUsername!: string | null;

  @Column({ name: 'message_kind', type: 'varchar', length: 16 })
  messageKind!: ChatcoopRoomMessageKind;

  @Column({ name: 'body_text', type: 'text' })
  bodyText!: string;

  @Column({
    name: 'origin_server_ts',
    type: 'bigint',
    transformer: {
      to: (value: number): string => String(value),
      from: (value: string): number => Number(value),
    },
  })
  originServerTs!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
