import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'

const rawDebtSelector = {
  _id: true,
  id: true,
  block_num: true,
  present: true,
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
