import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ShareType } from '../../domain/entities/result-share.entity';
import { ProjectTypeormEntity } from './project.typeorm-entity';
import { ContributorTypeormEntity } from './contributor.typeorm-entity';

@Entity('capital_result_shares')
export class ResultShareTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  projectId!: string;

  @Column({ type: 'uuid' })
  contributorId!: string;

  @Column({
    type: 'enum',
    enum: ShareType,
  })
  type!: ShareType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  timeSpent!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourRate!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  baseCost!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creatorBonus!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  authorBonus!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  loanReceived!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  finalShare!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  sharePercent!: number;

  @Column({ type: 'boolean', default: false })
  isCalculated!: boolean;

  @Column({ type: 'boolean', default: false })
  isDistributed!: boolean;

  @Column({ type: 'json', nullable: true })
  calculationDetails?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  distributedAt?: Date;

  // Связи
  @ManyToOne(() => ProjectTypeormEntity, (project) => project.shares)
  @JoinColumn({ name: 'projectId' })
  project!: ProjectTypeormEntity;

  @ManyToOne(() => ContributorTypeormEntity, (contributor) => contributor.shares)
  @JoinColumn({ name: 'contributorId' })
  contributor!: ContributorTypeormEntity;
}
