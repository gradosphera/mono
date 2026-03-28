import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('chatcoop_calendar_events')
export class CalendarEventTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('IDX_chatcoop_calendar_events_matrix_room')
  @Column({ name: 'matrix_room_id', type: 'varchar', length: 255 })
  matrixRoomId!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt!: Date | null;

  @Index('IDX_chatcoop_calendar_events_created_by')
  @Column({ name: 'created_by_username', type: 'varchar', length: 255 })
  createdByUsername!: string;

  @Column({ name: 'ics_sequence', type: 'int', default: 0 })
  icsSequence!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
