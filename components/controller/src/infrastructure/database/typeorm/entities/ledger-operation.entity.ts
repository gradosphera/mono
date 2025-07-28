import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * TypeORM сущность для операций ledger
 * Хранит историю всех операций по счетам кооператива
 */
@Entity('ledger_operations')
@Index(['coopname', 'created_at'])
@Index(['coopname', 'account_id', 'created_at'])
@Index(['coopname', 'from_account_id', 'created_at'])
@Index(['coopname', 'to_account_id', 'created_at'])
export class LedgerOperationEntity {
  @PrimaryColumn({ type: 'bigint' })
  global_sequence!: number;

  @Column({ type: 'varchar', length: 12, nullable: false })
  @Index()
  coopname!: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  action!: string;

  @CreateDateColumn()
  created_at!: Date;

  // Поля для операций add, sub, block, unblock
  @Column({ type: 'bigint', nullable: true })
  account_id?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  quantity?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  // Поля для операции transfer
  @Column({ type: 'bigint', nullable: true })
  from_account_id?: number;

  @Column({ type: 'bigint', nullable: true })
  to_account_id?: number;
}
