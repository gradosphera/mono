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
  /** под-действие soviet (`data.action`) — для фильтрации списка по типам документов */
  action: string;
  registry_id: number;
  full_title: string;
  /** html заявления без тегов — для ILIKE-поиска */
  content_text: string;
  /** bigint из блокчейна приходит строкой */
  block_num: string | null;
  document_created_at: Date | null;
  /** готовый агрегат пакета (statement/decision/acts/links) — отдаётся getDocuments как есть */
  document_aggregate: DocumentPackageAggregateDomainInterface | null;
  /** data действия-носителя заявления — для пересборки агрегата при доприходе decision/act/link */
  source_action_data: Record<string, unknown> | null;
}

export interface SignedDocumentSearchParams {
  coopname: string;
  query: string;
  limit: number;
}

/**
 * Результат поиска — повторяет контракт SearchResultDTO (GraphQL `searchDocuments`).
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

/** Параметры выборки готовых агрегатов для списка документов (read-path getDocuments). */
export interface SignedDocumentListParams {
  coopname: string;
  status?: SignedDocumentStatus;
  /** фильтр по под-действиям (data.action) */
  actions?: string[];
  /** фильтр по пайщику */
  username?: string;
  afterBlock?: number;
  beforeBlock?: number;
  page: number;
  limit: number;
}

export interface SignedDocumentListResult {
  items: DocumentPackageAggregateDomainInterface[];
  total: number;
}

/**
 * Репозиторий реестра подписанных документов (Postgres-проекция).
 * Единый источник для отображения (getDocuments) и поиска (searchDocuments) — задача C28-21.
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

  /** Кол-во записей реестра по кооперативу (для авто-триггера backfill на пустой базе). */
  count(coopname: string): Promise<number>;

  /** data действия-носителя заявления — для пересборки агрегата (decision/act/link). */
  getSourceActionData(coopname: string, packageHash: string): Promise<Record<string, unknown> | null>;

  /** Поиск по реестру (ILIKE по full_title/username/content_text). */
  search(params: SignedDocumentSearchParams): Promise<SignedDocumentSearchHit[]>;

  /** Список готовых агрегатов с пагинацией и фильтрами (read-path getDocuments). */
  findAggregates(params: SignedDocumentListParams): Promise<SignedDocumentListResult>;
}

/** Токен для инъекции зависимости репозитория реестра подписанных документов. */
export const SIGNED_DOCUMENT_REPOSITORY = Symbol('SignedDocumentRepository');
