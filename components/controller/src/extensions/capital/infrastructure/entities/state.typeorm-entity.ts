import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { IStateBlockchainData } from '../../domain/interfaces/state-blockchain.interface';

const EntityName = 'capital_state';
@Entity(EntityName)
@Index(`idx_${EntityName}_coopname`, ['coopname'])
export class StateTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (state.hpp)
  @Column({ type: 'varchar', length: 12, unique: true })
  coopname!: string;

  @Column({ type: 'varchar' })
  global_available_invest_pool!: string;

  @Column({ type: 'varchar' })
  program_membership_funded!: string;

  @Column({ type: 'varchar' })
  program_membership_available!: string;

  @Column({ type: 'varchar' })
  program_membership_distributed!: string;

  @Column({ type: 'float' })
  program_membership_cumulative_reward_per_share!: number;

  @Column({ type: 'json' })
  config!: IStateBlockchainData['config'];

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
