import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { SignedDocumentStatus } from '~/domain/document/enums/signed-document-status.enum';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';

/**
 * Реестр подписанных документов (Postgres-проекция, задача C28-21).
 *
 * Одна строка = один пакет документа (поле `package` связывает submitted↔resolved↔declined).
 * Наполняется ingestion-листенером blockchain-событий контракта soviet и разовым backfill'ом.
 *
 * `document_aggregate` хранит ГОТОВЫЙ агрегат пакета (statement/decision/acts/links вместе с
 * контентом и бинарём) — отсюда `getDocuments` отдаёт список без сборки на лету и без обращений
 * к explorer/Mongo. Колонки `full_title`/`content_text`/`action`/… — денормализованная проекция
 * для индексируемого поиска и фильтрации.
 *
 * Примечание: имя TS-поля `packageHash` (а не `package`) — `package` зарезервировано в strict-mode;
 * в БД колонка называется `package`.
 */
@Entity('signed_documents')
@Index(['coopname', 'package'], { unique: true })
@Index(['coopname', 'status'])
@Index(['coopname', 'status', 'action'])
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

  /** Под-действие soviet (`data.action`) — для фильтра getDocuments по типам документов */
  @Column({ type: 'varchar', length: 20, default: '' })
  action!: string;

  @Column({ type: 'int', default: 0 })
  registry_id!: number;

  @Column({ type: 'text', default: '' })
  full_title!: string;

  /** html заявления без тегов — индекс для ILIKE-поиска */
  @Column({ type: 'text', default: '' })
  content_text!: string;

  /** ФИО/наименования всех подписантов пакета (из signer_certificate всех частей агрегата) —
   * основной индекс для поиска по фамилии подписанта + их username */
  @Column({ type: 'text', default: '' })
  signers_text!: string;

  @Column({ type: 'bigint', nullable: true })
  block_num!: string | null;

  /** дата создания документа (из meta.created_at) — для сортировки списка */
  @Column({ type: 'timestamptz', nullable: true })
  document_created_at!: Date | null;

  /** ГОТОВЫЙ агрегат пакета: statement/decision/acts/links c контентом и бинарём (PDF base64) */
  @Column({ type: 'jsonb', nullable: true })
  document_aggregate!: DocumentPackageAggregateDomainInterface | null;

  /** действие-носитель заявления (newsubmitted/newresolved/newdeclined) целиком — для пересборки
   * агрегата при доприходе newdecision/newact/newlink по тому же пакету */
  @Column({ type: 'jsonb', nullable: true })
  source_action_data!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
