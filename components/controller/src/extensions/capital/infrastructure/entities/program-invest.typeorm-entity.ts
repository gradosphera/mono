import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ProgramInvestStatus } from '../../domain/enums/program-invest-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_program_invests';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_invest_hash`, ['invest_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_status`, ['status'])
export class ProgramInvestTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (program_invests.hpp)
  @Column({ type: 'varchar' })
  coopname!: string;

  @Column({ type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar' })
  invest_hash!: string;

  @Column({ type: 'varchar' })
  blockchain_status!: string;

  @Column({ type: 'timestamp' })
  invested_at!: Date;

  @Column({ type: 'json' })
  statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'varchar' })
  amount!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at_db!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: ProgramInvestStatus,
    default: ProgramInvestStatus.CREATED,
  })
  status!: ProgramInvestStatus;
}
