import type { Queries, Zeus } from '@coopenomics/sdk';

export type ILedgerState =
  Queries.Ledger.GetLedger.IOutput[typeof Queries.Ledger.GetLedger.name];
export type IGetLedgerInput = Queries.Ledger.GetLedger.IInput['data'];
export type ILedgerAccount = Zeus.ModelTypes['ChartOfAccountsItem'];
