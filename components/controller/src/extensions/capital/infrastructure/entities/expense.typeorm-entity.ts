import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ExpenseStatus } from '../../domain/enums/expense-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_expenses';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['blockchain_id'])
@Index(`idx_${EntityName}_expense_hash`, ['expense_hash'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_status`, ['status'])
export class ExpenseTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  blockchain_id?: string;

  @Column({ type: 'integer', nullable: true })
  block_num?: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (expenses.hpp)
  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 12 })
  username!: string;

  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({ type: 'varchar', length: 64 })
  expense_hash!: string;

  @Column({ type: 'varchar', length: 64 })
  fund_id!: string;

  @Column({ type: 'varchar', length: 20 })
  blockchain_status!: string;

  @Column({ type: 'bigint' })
  amount!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'json' })
  expense_statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  approved_statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  authorization!: ISignedDocumentDomainInterface;

  @Column({ type: 'timestamp' })
  spended_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status!: ExpenseStatus;
}
