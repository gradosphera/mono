import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawInvestSelector = {
  _id: true,
  id: true,
  block_num: true,
  present: true,
  status: true,
  invest_hash: true,
  coopname: true,
  username: true,
  project_hash: true,
  blockchain_status: true,
  amount: true,
  invested_at: true,
  statement: true,
  coordinator: true,
  coordinator_amount: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalInvest']> = rawInvestSelector

export type investModel = ModelTypes['CapitalInvest']

export const investSelector = Selector('CapitalInvest')(rawInvestSelector)
export { rawInvestSelector }
