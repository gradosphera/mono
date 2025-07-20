import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CommitStatus } from '../../domain/entities/commit.entity';
import { AssignmentTypeormEntity } from './assignment.typeorm-entity';
import { ContributorTypeormEntity } from './contributor.typeorm-entity';

@Entity('capital_commits')
export class CommitTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  assignmentId!: string;

  @Column({ type: 'uuid' })
  creatorId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  externalRepoUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  externalDbReference?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  hoursSpent!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourRate!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalCost!: number;

  @Column({
    type: 'enum',
    enum: CommitStatus,
    default: CommitStatus.SUBMITTED,
  })
  status!: CommitStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ type: 'text', nullable: true })
  reviewComment?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Связи
  @ManyToOne(() => AssignmentTypeormEntity, (assignment) => assignment.commits)
  @JoinColumn({ name: 'assignmentId' })
  assignment!: AssignmentTypeormEntity;

  @ManyToOne(() => ContributorTypeormEntity, (contributor) => contributor.commits)
  @JoinColumn({ name: 'creatorId' })
  creator!: ContributorTypeormEntity;
}
