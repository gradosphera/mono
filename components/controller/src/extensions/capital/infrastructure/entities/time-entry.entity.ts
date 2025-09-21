import { Entity, Column, Index } from 'typeorm';
import { BaseTypeormEntity } from './base.typeorm-entity';

/**
 * Сущность для хранения записей времени работы над задачами
 * Используется для автоматического расчета и распределения времени между коммитами
 */
@Entity('capital_time_entries')
@Index(['contributor_hash', 'date'])
@Index(['issue_hash', 'date'])
export class TimeEntryEntity extends BaseTypeormEntity {
  @Column({ type: 'varchar', length: 64, comment: 'Хеш вкладчика' })
  @Index()
  contributor_hash!: string;

  @Column({ type: 'varchar', length: 64, comment: 'Хеш задачи' })
  @Index()
  issue_hash!: string;

  @Column({ type: 'varchar', length: 64, comment: 'Хеш проекта' })
  @Index()
  project_hash!: string;

  @Column({ type: 'varchar', length: 64, comment: 'Имя кооператива' })
  coopname!: string;

  @Column({ type: 'date', comment: 'Дата работы (YYYY-MM-DD)' })
  date!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Количество часов' })
  hours!: number;

  @Column({ type: 'varchar', length: 64, nullable: true, comment: 'Хеш коммита, если время уже закоммичено' })
  commit_hash?: string;

  @Column({ type: 'boolean', default: false, comment: 'Флаг, что время закоммичено' })
  is_committed!: boolean;
}
