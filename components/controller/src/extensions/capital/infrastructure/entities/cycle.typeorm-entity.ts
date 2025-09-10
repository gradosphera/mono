import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, OneToMany } from 'typeorm';
import { CycleStatus } from '../../domain/enums/cycle-status.enum';
import { IssueTypeormEntity } from './issue.typeorm-entity';

const EntityName = 'capital_cycles';
@Entity(EntityName)
@Index(`idx_${EntityName}_status`, ['status'])
export class CycleTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({
    type: 'enum',
    enum: CycleStatus,
    default: CycleStatus.FUTURE,
  })
  status!: CycleStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // Связи
  @OneToMany(() => IssueTypeormEntity, (issue) => issue.cycle, { cascade: true })
  issues!: IssueTypeormEntity[];
}
