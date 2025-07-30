import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { paginationSelector } from '../../utils/paginationSelector'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawLedgerOperationSelector } from './ledgerOperationSelectors'

/**
 * Пагинированный селектор для истории операций ledger
 */
export const rawLedgerHistorySelector = { 
  ...paginationSelector, 
  items: rawLedgerOperationSelector 
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['LedgerHistoryResponse']> = rawLedgerHistorySelector

export type ledgerHistoryModel = ModelTypes['LedgerHistoryResponse']
export const ledgerHistorySelector = Selector('LedgerHistoryResponse')(rawLedgerHistorySelector) 