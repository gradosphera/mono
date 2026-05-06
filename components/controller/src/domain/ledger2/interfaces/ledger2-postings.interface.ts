/**
 * Бух.проводка ledger2 = пара действий (debit + credit) одного процесса,
 * закрытая между ближайшим предшествующим `apply` и следующим. В одном
 * processHash может быть несколько таких пар (multi-effect процессы типа
 * `p.cap.rid` — два apply, каждое со своей парой).
 *
 * Ключ парования = (processHash, parentApplyGlobalSequence). Внутри пары
 * debit предшествует credit по global_sequence — порядок гарантирован
 * контрактом ledger2 (см. apply.cpp).
 */
export interface Ledger2PostingDomainInterface {
  /** Стабильный ключ для UI: `${debitGlobalSequence}_${creditGlobalSequence ?? '_'}`. */
  key: string;
  blockNum: number;
  processHash: string | null;
  /** OPERATION_REGISTRY код из parent apply (`o.cap.lend` / `o.wal.depcpl` / ...). */
  operationCode: string | null;
  /** global_sequence parent apply'а — для дублирующего отображения и cross-link в реестр операций. */
  parentApplyGlobalSequence: string | null;
  debitGlobalSequence: string | null;
  /** id бух.счёта debit (×1000). */
  debitAccountId: number | null;
  creditGlobalSequence: string | null;
  /** id бух.счёта credit (×1000). */
  creditAccountId: number | null;
  /** Сумма проводки в asset-формате (`"100.0000 RUB"`). */
  quantity: string | null;
  memo: string | null;
  username: string | null;
  createdAt: Date;
}

export interface Ledger2PostingsFilterDomainInterface {
  coopname: string;
  /** id бух.счёта (×1000) — попадание в debit ИЛИ credit. */
  accountId?: number;
  username?: string;
  /** processHash — все проводки одной бизнес-операции. */
  processHash?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortOrder?: 'ASC' | 'DESC';
}

export interface Ledger2PostingsResponseDomainInterface {
  items: Ledger2PostingDomainInterface[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
