import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawConfigSelector = {
  coopname: true,
  coordinator_bonus_percent: true,
  expense_pool_percent: true,
  coordinator_invite_validity_days: true,
  voting_period_in_days: true,
  authors_voting_percent: true,
  creators_voting_percent: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalConfig']> = rawConfigSelector

export type configModel = ModelTypes['CapitalConfig']

export const configSelector = Selector('CapitalConfig')(rawConfigSelector)
export { rawConfigSelector }
