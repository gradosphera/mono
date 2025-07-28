import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawChartOfAccountsItemSelector } from './chartOfAccountsItemSelector'

const rawLedgerStateSelector = {
  coopname: true,
  chartOfAccounts: rawChartOfAccountsItemSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['LedgerState']> = rawLedgerStateSelector

export type ledgerStateModel = ModelTypes['LedgerState']

export const ledgerStateSelector = Selector('LedgerState')(rawLedgerStateSelector)
export { rawLedgerStateSelector } 