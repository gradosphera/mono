import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { TranscriptionStatus } from '../../domain/entities/call-transcription.entity';

// TypeORM сущность для хранения транскрипций звонков
@Entity('call_transcriptions')
export class CallTranscriptionTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'room_id' })
  roomId!: string;

  @Index()
  @Column({ name: 'matrix_room_id' })
  matrixRoomId!: string;

  @Column({ name: 'room_name' })
  roomName!: string;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt!: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt!: Date | null;

  @Column({ type: 'jsonb', default: '[]' })
  participants!: string[];

  @Column({
    type: 'enum',
    enum: TranscriptionStatus,
    default: TranscriptionStatus.ACTIVE,
  })
  status!: TranscriptionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
