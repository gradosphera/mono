import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { AppendixStatus } from '../../domain/enums/appendix-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_appendixes';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['blockchain_id'])
@Index(`idx_${EntityName}_appendix_hash`, ['appendix_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_status`, ['status'])
export class AppendixTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  blockchain_id!: string;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (appendix.hpp)
  @Column({ type: 'varchar', length: 12 })
  coopname!: string;

  @Column({ type: 'varchar', length: 12 })
  username!: string;

  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({ type: 'varchar', length: 64 })
  appendix_hash!: string;

  @Column({ type: 'varchar', length: 20 })
  blockchain_status!: string;

  @Column({ type: 'timestamp' })
  created_at!: Date;

  @Column({ type: 'json' })
  appendix!: ISignedDocumentDomainInterface;

  @CreateDateColumn({ type: 'timestamp' })
  created_at_db!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: AppendixStatus,
    default: AppendixStatus.CREATED,
  })
  status!: AppendixStatus;
}
