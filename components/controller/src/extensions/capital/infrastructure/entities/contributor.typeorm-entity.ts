import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ContributorStatus } from '../../domain/enums/contributor-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_contributors';

@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_hash`, ['contributor_hash'])
@Index(`idx_${EntityName}_coopname`, ['coopname'])
@Index(`idx_${EntityName}_status`, ['status'])
export class ContributorTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (contributors.hpp)
  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 12 })
  username!: string;

  @Column({ type: 'varchar', length: 64 })
  contributor_hash!: string;

  @Column({ type: 'varchar', length: 20 })
  blockchain_status!: string;

  @Column({ type: 'text', nullable: true })
  memo!: string;

  @Column({ type: 'boolean', default: false })
  is_external_contract!: boolean;

  @Column({ type: 'json', nullable: true })
  contract!: ISignedDocumentDomainInterface;

  @Column({ type: 'json', nullable: true })
  appendixes!: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  rate_per_hour!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  debt_amount!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reward_per_share_last!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contributed_as_investor!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contributed_as_creator!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contributed_as_author!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contributed_as_coordinator!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contributed_as_contributor!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contributed_as_propertor!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: ContributorStatus,
    default: ContributorStatus.PENDING,
  })
  status!: ContributorStatus;
}
