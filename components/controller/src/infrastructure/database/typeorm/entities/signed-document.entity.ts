import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { SignedDocumentStatus } from '~/domain/document/enums/signed-document-status.enum';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';

/**
 * Реестр подписанных документов (Postgres-проекция, задача C28-21).
 *
 * Одна строка = один пакет документа (поле `package` связывает submitted↔resolved↔declined).
 * Наполняется ingestion-листенером blockchain-событий контракта soviet и разовым backfill'ом.
 * Контент (full_title/html/pdf) и статус лежат вместе — отсюда честный поиск и сборка агрегата
 * без обращений к explorer/Mongo на каждый запрос.
 *
 * Примечание: имя TS-поля `packageHash` (а не `package`) — `package` зарезервировано в strict-mode,
 * ломает shorthand/деструктуризацию; в БД колонка называется `package`.
 */
@Entity('signed_documents')
@Index(['coopname', 'package'], { unique: true })
@Index(['coopname', 'status'])
@Index(['coopname', 'username'])
export class SignedDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50 })
  coopname!: string;

  @Column({ name: 'package', length: 64 })
  packageHash!: string;

  @Column({ length: 64 })
  hash!: string;

  @Column({ length: 50, default: '' })
  username!: string;

  @Column({ type: 'varchar', length: 20, default: SignedDocumentStatus.Submitted })
  status!: SignedDocumentStatus;

  @Column({ type: 'int', default: 0 })
  registry_id!: number;

  @Column({ type: 'text', default: '' })
  full_title!: string;

  /** html, очищенный от тегов — индекс для ILIKE-поиска */
  @Column({ type: 'text', default: '' })
  content_text!: string;

  @Column({ type: 'text', nullable: true })
  html!: string | null;

  /** PDF-бинарь как есть (~40–50 КБ; Postgres TOAST'ит и сжимает) */
  @Column({ type: 'bytea', nullable: true })
  pdf!: Buffer | null;

  @Column({ type: 'bigint', nullable: true })
  block_num!: string | null;

  /** денормализованный готовый агрегат пакета (statement/decision/acts/links) */
  @Column({ type: 'jsonb', nullable: true })
  document_aggregate!: DocumentPackageAggregateDomainInterface | null;

  /** мета документа (IMetaDocument) */
  @Column({ type: 'jsonb', nullable: true })
  meta!: Record<string, unknown> | null;

  /** дата создания самого документа (из meta.created_at), отдельно от created_at записи */
  @Column({ type: 'timestamptz', nullable: true })
  document_created_at!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
