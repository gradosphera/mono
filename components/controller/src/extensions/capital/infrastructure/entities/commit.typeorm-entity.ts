import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { CommitStatus } from '../../domain/enums/commit-status.enum';
import type { ICommitBlockchainData } from '../../domain/interfaces/commit-blockchain.interface';

const EntityName = 'capital_commits';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_commit_hash`, ['commit_hash'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_status`, ['status'])
export class CommitTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (commits.hpp)
  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 12 })
  username!: string;

  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({ type: 'varchar', length: 64 })
  commit_hash!: string;

  @Column({ type: 'json' })
  amounts!: ICommitBlockchainData['amounts'];

  @Column({ type: 'varchar', length: 20 })
  blockchain_status!: string;

  @Column({ type: 'timestamp' })
  created_at!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: CommitStatus,
    default: CommitStatus.PENDING,
  })
  status!: CommitStatus;
}
