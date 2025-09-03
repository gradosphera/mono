import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ContributorRole } from '../../domain/interfaces/contributor.entity';
import { CommitTypeormEntity } from './commit.typeorm-entity';
import { ResultShareTypeormEntity } from './result-share.typeorm-entity';

@Entity('capital_contributors')
export class ContributorTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2000 })
  personalHourCost!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalInvestedAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWorkedHours!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEarnedAmount!: number;

  @Column({
    type: 'simple-array',
    transformer: {
      to: (value: ContributorRole[]) => value,
      from: (value: string) => (value ? (value.split(',') as ContributorRole[]) : []),
    },
  })
  roles!: ContributorRole[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Связи
  @OneToMany(() => CommitTypeormEntity, (commit) => commit.creator)
  commits!: CommitTypeormEntity[];

  @OneToMany(() => ResultShareTypeormEntity, (share) => share.contributor)
  shares!: ResultShareTypeormEntity[];
}
