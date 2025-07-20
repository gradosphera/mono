import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AssignmentStatus } from '../../domain/entities/assignment.entity';
import { ProjectTypeormEntity } from './project.typeorm-entity';
import { CommitTypeormEntity } from './commit.typeorm-entity';

@Entity('capital_assignments')
export class AssignmentTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  projectId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.DRAFT,
  })
  status!: AssignmentStatus;

  @Column({ type: 'uuid' })
  masterId!: string;

  @Column({
    type: 'simple-array',
    transformer: {
      to: (value: string[]) => value.join(','),
      from: (value: string) => (value ? value.split(',') : []),
    },
  })
  assignedCreators!: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedHours!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedExpenses!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualHours!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualExpenses!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  allocatedInvestment!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableForLoan!: number;

  @Column({ type: 'json' })
  stories!: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    completedAt: Date;
  }>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date;

  // Связи
  @ManyToOne(() => ProjectTypeormEntity, (project) => project.assignments)
  @JoinColumn({ name: 'projectId' })
  project!: ProjectTypeormEntity;

  @OneToMany(() => CommitTypeormEntity, (commit) => commit.assignment)
  commits!: CommitTypeormEntity[];
}
