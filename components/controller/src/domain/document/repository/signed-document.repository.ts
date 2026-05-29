import type { SignedDocumentStatus } from '../enums/signed-document-status.enum';
import type { DocumentPackageAggregateDomainInterface } from '../interfaces/document-package-aggregate-domain.interface';

/**
 * Данные для записи/обновления одной записи реестра подписанных документов.
 * Одна запись = ОДИН документ-заявление (ключ — `hash`). `packageHash` — идентификатор процесса,
 * общий для нескольких заявлений пакета (submitted↔resolved↔declined трекаются по `hash` документа).
 */
export interface SignedDocumentUpsertInput {
  coopname: string;
  /** checksum256 процесса (`package` в blockchain-action; НЕ уникален — группирует заявления) */
  packageHash: string;
  /** checksum256 самого документа-заявления — УНИКАЛЬНЫЙ ключ записи */
  hash: string;
  username: string;
  status: SignedDocumentStatus;
  /** под-действие soviet (`data.action`) — для фильтрации списка по типам документов */
  action: string;
  registry_id: number;
  full_title: string;
  /** html заявления без тегов — для ILIKE-поиска */
  content_text: string;
  /** ФИО/наименования всех подписантов пакета + их username — для поиска по подписанту */
  signers_text: string;
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
  /** фильтр по хэшу конкретного документа-заявления */
  hash?: string;
  afterBlock?: number;
  beforeBlock?: number;
  page: number;
  limit: number;
}

export interface SignedDocumentListResult {
  items: DocumentPackageAggregateDomainInterface[];
  total: number;
}

/** Строка реестра для пересборки агрегата: документ-заявление пакета + его действие-носитель. */
export interface SignedDocumentPackageRow {
  hash: string;
  status: SignedDocumentStatus;
  sourceActionData: Record<string, unknown> | null;
}

/**
 * Репозиторий реестра подписанных документов (Postgres-проекция).
 * Единый источник для отображения (getDocuments) и поиска (searchDocuments) — задача C28-21.
 * Запись = один документ-заявление (ключ `hash`); `package` группирует заявления одного процесса.
 */
export interface SignedDocumentRepository {
  /** Вставить или обновить запись по (coopname, hash). */
  upsert(input: SignedDocumentUpsertInput): Promise<void>;

  /** Текущий статус документа по его hash или null, если записи нет. */
  getStatus(coopname: string, hash: string): Promise<SignedDocumentStatus | null>;

  /** Кол-во записей реестра по кооперативу (для авто-триггера backfill на пустой базе). */
  count(coopname: string): Promise<number>;

  /** Все заявления одного процесса (package) — для пересборки агрегатов при доприходе
   *  decision/act/link (на пакет может приходиться несколько заявлений с разными подписантами). */
  findByPackage(coopname: string, packageHash: string): Promise<SignedDocumentPackageRow[]>;

  /** Поиск по реестру (ILIKE по signers_text/full_title/content_text/username). */
  search(params: SignedDocumentSearchParams): Promise<SignedDocumentSearchHit[]>;

  /** Список готовых агрегатов с пагинацией и фильтрами (read-path getDocuments). */
  findAggregates(params: SignedDocumentListParams): Promise<SignedDocumentListResult>;
}

/** Токен для инъекции зависимости репозитория реестра подписанных документов. */
export const SIGNED_DOCUMENT_REPOSITORY = Symbol('SignedDocumentRepository');
