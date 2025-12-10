/**
 * Доменный интерфейс для операции ledger
 */
export interface LedgerOperationDomainInterface {
  global_sequence: number;
  coopname: string;
  action: string;
  created_at: Date;
  account_id?: number;
  quantity?: string;
  comment?: string;
  hash?: string;
  username?: string;
}

/**
 * Доменный интерфейс для запроса истории операций
 */
export interface GetLedgerHistoryInputDomainInterface {
  coopname: string;
  account_id?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Доменный интерфейс для ответа с историей операций
 */
export interface LedgerHistoryResponseDomainInterface {
  items: LedgerOperationDomainInterface[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
