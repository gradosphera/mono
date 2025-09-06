import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ProgramWithdrawStatus } from '../../domain/enums/program-withdraw-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_program_withdraws';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['blockchain_id'])
@Index(`idx_${EntityName}_withdraw_hash`, ['withdraw_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_status`, ['status'])
export class ProgramWithdrawTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  blockchain_id?: string;

  @Column({ type: 'integer', nullable: true })
  block_num?: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (program_withdraw.hpp)
  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 64 })
  withdraw_hash!: string;

  @Column({ type: 'varchar', length: 12 })
  username!: string;

  @Column({ type: 'varchar', length: 20 })
  blockchain_status!: string;

  @Column({ type: 'varchar', length: 64 })
  amount!: string;

  @Column({ type: 'json' })
  statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'timestamp' })
  created_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at_db!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: ProgramWithdrawStatus,
    default: ProgramWithdrawStatus.CREATED,
  })
  status!: ProgramWithdrawStatus;
}
