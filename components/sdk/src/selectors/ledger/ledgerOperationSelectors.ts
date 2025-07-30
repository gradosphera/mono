import { type ModelTypes, Selector } from '../../zeus/index'

/**
 * Селектор для операции ledger
 */
export const rawLedgerOperationSelector = {
  global_sequence: true,
  coopname: true,
  action: true,
  created_at: true,
  account_id: true,
  quantity: true,
  comment: true,
}

export type ledgerOperationModel = ModelTypes['LedgerOperation']
export const ledgerOperationSelector = Selector('LedgerOperation')(rawLedgerOperationSelector)