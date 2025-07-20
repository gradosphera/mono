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
import { ProjectStatus } from '../../domain/entities/project.entity';
import { CycleTypeormEntity } from './cycle.typeorm-entity';
import { AssignmentTypeormEntity } from './assignment.typeorm-entity';
import { ResultShareTypeormEntity } from './result-share.typeorm-entity';

@Entity('capital_projects')
export class ProjectTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  cycleId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.WAITING,
  })
  status!: ProjectStatus;

  @Column({ type: 'json' })
  authors: Array<{
    contributorId: string;
    sharePercent: number;
  }> = [];

  @Column({ type: 'uuid', nullable: true })
  masterId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  plannedHours!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  plannedExpenses!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualHours!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualExpenses!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalInvestment!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableInvestment!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Связи
  @ManyToOne(() => CycleTypeormEntity, (cycle) => cycle.projects)
  @JoinColumn({ name: 'cycleId' })
  cycle: CycleTypeormEntity = new CycleTypeormEntity();

  @OneToMany(() => AssignmentTypeormEntity, (assignment) => assignment.project)
  assignments: AssignmentTypeormEntity[] = [];

  @OneToMany(() => ResultShareTypeormEntity, (share) => share.project)
  shares: ResultShareTypeormEntity[] = [];
}
