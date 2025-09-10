import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ResultStatus } from '../../domain/enums/result-status.enum';
import { IResultBlockchainData } from '../../domain/interfaces/result-blockchain.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_results';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_result_hash`, ['result_hash'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_status`, ['status'])
export class ResultTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (results.hpp)
  @Column({ type: 'varchar' })
  project_hash!: string;

  @Column({ type: 'varchar' })
  result_hash!: string;

  @Column({ type: 'varchar' })
  coopname!: string;

  @Column({ type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar' })
  blockchain_status!: string;

  @Column({ type: 'timestamp' })
  created_at!: Date;

  @Column({ type: 'bigint' })
  creator_base_amount!: string;

  @Column({ type: 'bigint' })
  author_base_amount!: string;

  @Column({ type: 'bigint' })
  debt_amount!: string;

  @Column({ type: 'bigint' })
  creator_bonus_amount!: string;

  @Column({ type: 'bigint' })
  author_bonus_amount!: string;

  @Column({ type: 'bigint' })
  generation_amount!: string;

  @Column({ type: 'bigint' })
  capitalist_bonus_amount!: string;

  @Column({ type: 'bigint' })
  total_amount!: string;

  @Column({ type: 'bigint' })
  available_for_return!: string;

  @Column({ type: 'bigint' })
  available_for_convert!: string;

  @Column({ type: 'json' })
  statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  authorization!: IResultBlockchainData['authorization'];

  @Column({ type: 'json' })
  act!: IResultBlockchainData['act'];

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: ResultStatus,
    default: ResultStatus.PENDING,
  })
  status!: ResultStatus;
}
