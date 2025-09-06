import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

const EntityName = 'capital_project_wallets';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['blockchain_id'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
export class ProjectWalletTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  blockchain_id?: string;

  @Column({ type: 'integer', nullable: true })
  block_num?: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (wallets.hpp)
  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({ type: 'varchar', length: 12 })
  username!: string;

  @Column({ type: 'varchar', length: 64 })
  shares!: string;

  @Column({ type: 'float' })
  last_membership_reward_per_share!: number;

  @Column({ type: 'varchar', length: 64 })
  membership_available!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at_db!: Date;
}
