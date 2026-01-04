import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { LogEventType } from '../../domain/enums/log-event-type.enum';

export const EntityName = 'capital_logs';

/**
 * TypeORM сущность для хранения логов событий в системе капитала
 */
@Entity(EntityName)
@Index(`idx_${EntityName}_coopname`, ['coopname'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_event_type`, ['event_type'])
@Index(`idx_${EntityName}_initiator`, ['initiator'])
@Index(`idx_${EntityName}_created_at`, ['created_at'])
@Index(`idx_${EntityName}_project_created`, ['project_hash', 'created_at'])
@Index(`idx_${EntityName}_initiator_created`, ['initiator', 'created_at'])
export class LogTypeormEntity {
  static getTableName(): string {
    return EntityName;
  }

  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({
    type: 'enum',
    enum: LogEventType,
  })
  event_type!: LogEventType;

  @Column({ type: 'varchar', length: 12 })
  initiator!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  reference_id?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text' })
  message!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
