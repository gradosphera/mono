import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CycleStatus } from '../../domain/entities/cycle.entity';
import { ProjectTypeormEntity } from './project.typeorm-entity';

@Entity('capital_cycles')
export class CycleTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CycleStatus,
    default: CycleStatus.WAITING,
  })
  status!: CycleStatus;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  endDate!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Связи
  @OneToMany(() => ProjectTypeormEntity, (project) => project.cycle)
  projects!: ProjectTypeormEntity[];
}
