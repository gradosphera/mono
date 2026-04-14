import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('chatcoop_managed_matrix_rooms')
export class ManagedMatrixRoomTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'matrix_room_id', type: 'varchar', length: 255, unique: true })
  matrixRoomId!: string;

  @Column({ type: 'boolean' })
  encrypted!: boolean;

  @Index('IDX_chatcoop_managed_matrix_rooms_room_kind')
  @Column({ name: 'room_kind', type: 'varchar', length: 32 })
  roomKind!: string;

  @Column({ name: 'display_label', type: 'varchar', length: 500 })
  displayLabel!: string;

  @Column({ name: 'project_hash', type: 'varchar', length: 64, nullable: true })
  projectHash!: string | null;

  /** Сервисный аккаунт секретаря состоит в комнате (синхронизируется с Matrix при старте и после join) */
  @Column({ name: 'secretary_in_room', type: 'boolean', default: false })
  secretaryInRoom!: boolean;

  /** Токен Matrix GET /messages (dir=b) для продолжения к старым событиям; null если не начат или сброшен */
  @Column({ name: 'message_history_pagination_token', type: 'text', nullable: true })
  messageHistoryPaginationToken!: string | null;

  /** true — backfill дошёл до конца ленты; дальше только «голова» без повторного обхода старых */
  @Column({ name: 'message_history_backfill_complete', type: 'boolean', default: false })
  messageHistoryBackfillComplete!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
