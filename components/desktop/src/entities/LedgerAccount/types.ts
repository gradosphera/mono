import type { Queries, Zeus } from '@coopenomics/sdk';

export type ILedgerState =
  Queries.Ledger.GetLedger.IOutput[typeof Queries.Ledger.GetLedger.name];
export type IGetLedgerInput = Queries.Ledger.GetLedger.IInput['data'];
export type ILedgerAccount = Zeus.ModelTypes['ChartOfAccountsItem'];

// Типы для истории операций ledger
export type ILedgerHistoryResponse =
  Queries.Ledger.GetLedgerHistory.IOutput[typeof Queries.Ledger.GetLedgerHistory.name];
export type IGetLedgerHistoryInput =
  Queries.Ledger.GetLedgerHistory.IInput['data'];
export type ILedgerOperation = Zeus.ModelTypes['LedgerOperation'];

// Интерфейс для пагинации истории операций
export interface ILedgerHistoryPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// Интерфейс для параметров фильтрации истории
export interface ILedgerHistoryFilter {
  coopname: string;
  account_id?: number;
  page?: number;
  limit?: number;
}
