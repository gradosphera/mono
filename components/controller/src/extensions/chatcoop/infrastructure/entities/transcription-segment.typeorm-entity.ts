import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

// TypeORM сущность для хранения сегментов транскрипции
@Entity('transcription_segments')
export class TranscriptionSegmentTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'transcription_id' })
  transcriptionId!: string;

  @Index()
  @Column({ name: 'speaker_identity' })
  speakerIdentity!: string;

  @Column({ name: 'speaker_name' })
  speakerName!: string;

  @Column({ type: 'text' })
  text!: string;

  @Column({ name: 'start_offset', type: 'float' })
  startOffset!: number;

  @Column({ name: 'end_offset', type: 'float' })
  endOffset!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
