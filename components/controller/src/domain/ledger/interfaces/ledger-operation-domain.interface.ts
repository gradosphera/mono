/**
 * Базовый доменный интерфейс для операции ledger
 */
export interface LedgerOperationBaseDomainInterface {
  global_sequence: number;
  coopname: string;
  action: string;
  created_at: Date;
}

/**
 * Доменный интерфейс для операции пополнения счета (add)
 */
export interface LedgerAddOperationDomainInterface extends LedgerOperationBaseDomainInterface {
  action: 'add';
  account_id: number;
  quantity: string;
  comment: string;
}

/**
 * Доменный интерфейс для операции списания со счета (sub)
 */
export interface LedgerSubOperationDomainInterface extends LedgerOperationBaseDomainInterface {
  action: 'sub';
  account_id: number;
  quantity: string;
  comment: string;
}

/**
 * Доменный интерфейс для операции перевода между счетами (transfer)
 */
export interface LedgerTransferOperationDomainInterface extends LedgerOperationBaseDomainInterface {
  action: 'transfer';
  from_account_id: number;
  to_account_id: number;
  quantity: string;
  comment: string;
}

/**
 * Доменный интерфейс для операции блокировки средств (block)
 */
export interface LedgerBlockOperationDomainInterface extends LedgerOperationBaseDomainInterface {
  action: 'block';
  account_id: number;
  quantity: string;
  comment: string;
}

/**
 * Доменный интерфейс для операции разблокировки средств (unblock)
 */
export interface LedgerUnblockOperationDomainInterface extends LedgerOperationBaseDomainInterface {
  action: 'unblock';
  account_id: number;
  quantity: string;
  comment: string;
}

/**
 * Объединяющий тип для всех операций ledger
 */
export type LedgerOperationDomainInterface =
  | LedgerAddOperationDomainInterface
  | LedgerSubOperationDomainInterface
  | LedgerTransferOperationDomainInterface
  | LedgerBlockOperationDomainInterface
  | LedgerUnblockOperationDomainInterface;

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
