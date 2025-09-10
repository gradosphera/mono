import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { AppendixStatus } from '../../domain/enums/appendix-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_appendixes';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_appendix_hash`, ['appendix_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_status`, ['status'])
export class AppendixTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (appendix.hpp)
  @Column({ type: 'varchar' })
  coopname!: string;

  @Column({ type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar' })
  project_hash!: string;

  @Column({ type: 'varchar' })
  appendix_hash!: string;

  @Column({ type: 'varchar' })
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
