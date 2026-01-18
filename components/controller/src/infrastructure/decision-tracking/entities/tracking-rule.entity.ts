import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('tracking_rules')
export class TrackingRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  @Index()
  hash!: string;

  @Column({ type: 'varchar', length: 20 })
  event_type!: string;

  @Column({ type: 'varchar', length: 50 })
  vars_field!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
