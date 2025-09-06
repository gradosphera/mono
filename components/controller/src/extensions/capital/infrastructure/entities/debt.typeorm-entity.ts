import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { DebtStatus } from '../../domain/enums/debt-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_debts';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['blockchain_id'])
@Index(`idx_${EntityName}_debt_hash`, ['debt_hash'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_status`, ['status'])
export class DebtTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  blockchain_id?: string;

  @Column({ type: 'integer', nullable: true })
  block_num?: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (debts.hpp)
  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 12 })
  username!: string;

  @Column({ type: 'varchar', length: 64 })
  debt_hash!: string;

  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({ type: 'varchar', length: 20 })
  blockchain_status!: string;

  @Column({ type: 'timestamp', nullable: true })
  repaid_at?: Date;

  @Column({ type: 'bigint' })
  amount!: string;

  @Column({ type: 'json' })
  statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  approved_statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  authorization!: ISignedDocumentDomainInterface;

  @Column({ type: 'text', nullable: true })
  memo?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: DebtStatus,
    default: DebtStatus.PENDING,
  })
  status!: DebtStatus;
}
