import { Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

export const GITHUB_COMM_TRANSCRIPTION_CURSOR_TABLE = 'capital_github_comm_transcription_cursor';

@Entity(GITHUB_COMM_TRANSCRIPTION_CURSOR_TABLE)
@Unique('uq_capital_github_comm_tr_cursor', ['coopname', 'projectHash'])
export class GithubCommTranscriptionCursorTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  coopname!: string;

  @Column({ name: 'project_hash', type: 'varchar', length: 64 })
  projectHash!: string;

  /** В exclusive-смысле: выбираем транскрипции с ended_at > этого значения. */
  @Column({ name: 'last_ended_at_exclusive', type: 'timestamptz' })
  lastEndedAtExclusive!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
