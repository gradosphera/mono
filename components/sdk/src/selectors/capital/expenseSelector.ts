import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { documentAggregateSelector } from '../documents'

const rawExpenseSelector = {
  _id: true,
  id: true,
  block_num: true,
  present: true,
  status: true,
  expense_hash: true,
  coopname: true,
  username: true,
  project_hash: true,
  fund_id: true,
  blockchain_status: true,
  amount: true,
  description: true,
  spended_at: true,
  expense_statement: documentAggregateSelector,
  approved_statement: documentAggregateSelector,
  authorization: documentAggregateSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalExpense']> = rawExpenseSelector

export type expenseModel = ModelTypes['CapitalExpense']

export const expenseSelector = Selector('CapitalExpense')(rawExpenseSelector)
export { rawExpenseSelector }
