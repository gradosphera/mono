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

// Типы для конкретных операций
export type ILedgerAddOperation = Zeus.ModelTypes['LedgerAddOperation'];
export type ILedgerSubOperation = Zeus.ModelTypes['LedgerSubOperation'];
export type ILedgerTransferOperation =
  Zeus.ModelTypes['LedgerTransferOperation'];
export type ILedgerBlockOperation = Zeus.ModelTypes['LedgerBlockOperation'];
export type ILedgerUnblockOperation = Zeus.ModelTypes['LedgerUnblockOperation'];

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
