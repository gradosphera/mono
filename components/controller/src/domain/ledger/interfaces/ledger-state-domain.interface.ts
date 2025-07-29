import type { ChartOfAccountsItemDomainInterface } from './chart-of-accounts-item-domain.interface';

/**
 * Интерфейс для полного состояния ledger кооператива
 */
export interface LedgerStateDomainInterface {
  /** Имя кооператива */
  coopname: string;
  /** План счетов с актуальными данными */
  chartOfAccounts: ChartOfAccountsItemDomainInterface[];
}
