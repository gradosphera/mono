import { Entity, Column, Index } from 'typeorm';
import { AppendixStatus } from '../../domain/enums/appendix-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
import { BaseTypeormEntity } from './base.typeorm-entity';

const EntityName = 'capital_appendixes';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_appendix_hash`, ['appendix_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_status`, ['status'])
@Index(`idx_${EntityName}_created_at`, ['_created_at'])
export class AppendixTypeormEntity extends BaseTypeormEntity {
  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

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

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: AppendixStatus,
    default: AppendixStatus.CREATED,
  })
  status!: AppendixStatus;
}
