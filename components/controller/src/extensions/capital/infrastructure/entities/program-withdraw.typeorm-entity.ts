import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ProgramWithdrawStatus } from '../../domain/enums/program-withdraw-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_program_withdraws';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_withdraw_hash`, ['withdraw_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_status`, ['status'])
export class ProgramWithdrawTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (program_withdraw.hpp)
  @Column({ type: 'varchar' })
  coopname!: string;

  @Column({ type: 'varchar' })
  withdraw_hash!: string;

  @Column({ type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar' })
  blockchain_status!: string;

  @Column({ type: 'varchar' })
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
