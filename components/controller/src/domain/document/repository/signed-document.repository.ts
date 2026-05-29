import type { SignedDocumentStatus } from '../enums/signed-document-status.enum';
import type { DocumentPackageAggregateDomainInterface } from '../interfaces/document-package-aggregate-domain.interface';

/**
 * Данные для записи/обновления одной записи реестра подписанных документов.
 * Одна запись = один пакет документа (`packageHash` связывает submitted↔resolved↔declined).
 */
export interface SignedDocumentUpsertInput {
  coopname: string;
  /** checksum256 пакета документа (`package` в blockchain-action; связывает все стадии) */
  packageHash: string;
  /** checksum256 самого документа-заявления */
  hash: string;
  username: string;
  status: SignedDocumentStatus;
  registry_id: number;
  full_title: string;
  /** html, очищенный от тегов — для полнотекстового ILIKE-поиска */
  content_text: string;
  /** исходный html для предпросмотра */
  html: string | null;
  /** PDF-бинарь как есть (bytea) */
  pdf: Buffer | null;
  /** bigint из блокчейна приходит строкой */
  block_num: string | null;
  /** мета документа (IMetaDocument) целиком */
  meta: Record<string, unknown> | null;
  /** денормализованный готовый агрегат пакета (заполняется на этапе сборки) */
  document_aggregate: DocumentPackageAggregateDomainInterface | null;
  document_created_at: Date | null;
}

export interface SignedDocumentSearchParams {
  coopname: string;
  query: string;
  limit: number;
}

/**
 * Результат поиска — повторяет контракт SearchResultDTO (GraphQL `searchDocuments`),
 * чтобы переключение резолвера на Postgres было прямой заменой источника.
 */
export interface SignedDocumentSearchHit {
  hash: string;
  full_title: string;
  username: string;
  coopname: string;
  registry_id: number;
  created_at: string | null;
  highlights: string[];
}

/**
 * Репозиторий реестра подписанных документов (Postgres-проекция).
 * Наполняется ловлей blockchain-событий контракта soviet (ingestion) и разовым backfill'ом;
 * используется как единый источник для отображения и поиска (задача C28-21).
 */
export interface SignedDocumentRepository {
  /** Вставить или обновить запись по (coopname, packageHash). */
  upsert(input: SignedDocumentUpsertInput): Promise<void>;

  /** Сменить статус записи по пакету. Возвращает true, если запись найдена. */
  setStatus(coopname: string, packageHash: string, status: SignedDocumentStatus): Promise<boolean>;

  /** Текущий статус записи по пакету или null, если записи нет. */
  getStatus(coopname: string, packageHash: string): Promise<SignedDocumentStatus | null>;

  /** Есть ли уже запись по пакету (для идемпотентного backfill). */
  exists(coopname: string, packageHash: string): Promise<boolean>;

  /** Поиск по реестру (ILIKE по full_title/username/content_text). */
  search(params: SignedDocumentSearchParams): Promise<SignedDocumentSearchHit[]>;
}

/** Токен для инъекции зависимости репозитория реестра подписанных документов. */
export const SIGNED_DOCUMENT_REPOSITORY = Symbol('SignedDocumentRepository');
