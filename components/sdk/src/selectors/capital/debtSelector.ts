import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'
import { baseCapitalSelector } from './baseCapitalSelector'
const rawDebtSelector = {
  ...baseCapitalSelector,
  id: true,
  status: true,
  debt_hash: true,
  coopname: true,
  username: true,
  project_hash: true,
  blockchain_status: true,
  repaid_at: true,
  amount: true,
  memo: true,
  statement: rawDocumentAggregateSelector,
  approved_statement: rawDocumentAggregateSelector,
  authorization: rawDocumentAggregateSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalDebt']> = rawDebtSelector

export type debtModel = ModelTypes['CapitalDebt']

export const debtSelector = Selector('CapitalDebt')(rawDebtSelector)
export { rawDebtSelector }
