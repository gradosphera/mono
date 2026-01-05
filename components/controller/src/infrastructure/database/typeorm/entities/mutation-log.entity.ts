import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import type { IMutationLogDomainInterface } from '~/domain/mutation-log/interfaces/mutation-log-domain.interface';

/**
 * TypeORM сущность лога мутации
 */
@Entity('mutation_logs')
@Index(['mutation_name', 'created_at'])
@Index(['username', 'created_at'])
@Index(['coopname', 'created_at'])
@Index(['status', 'created_at'])
export class MutationLogEntity implements IMutationLogDomainInterface {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  coopname?: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  mutation_name!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  username!: string;

  @Column({ type: 'jsonb' })
  arguments!: Record<string, any>;

  @Column({ type: 'int' })
  duration_ms!: number;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  status!: 'success' | 'error';

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Index()
  created_at!: Date;
}
