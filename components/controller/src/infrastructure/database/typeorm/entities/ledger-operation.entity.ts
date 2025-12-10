import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * TypeORM сущность для операций ledger
 * Хранит историю всех операций по счетам кооператива
 */
@Entity('ledger_operations')
@Index(['coopname', 'created_at'])
@Index(['coopname', 'account_id', 'created_at'])
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

  // Поля для операций debet, credit, block, unblock
  @Column({ type: 'bigint', nullable: true })
  account_id?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  quantity?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  @Index()
  hash?: string;

  @Column({ type: 'varchar', length: 12, nullable: true })
  @Index()
  username?: string;
}
