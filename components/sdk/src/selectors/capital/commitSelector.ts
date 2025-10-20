import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { baseCapitalSelector } from './baseCapitalSelector'
import { rawBaseProjectSelector } from './projectSelector'

const rawCommitAmountsSelector = {
  hour_cost: true,
  creators_hours: true,
  creators_base_pool: true,
  authors_base_pool: true,
  creators_bonus_pool: true,
  authors_bonus_pool: true,
  total_generation_pool: true,
  contributors_bonus_pool: true,
  total_contribution: true,
}

const rawCommitSelector = {
  ...baseCapitalSelector,
  id: true,
  status: true,
  commit_hash: true,
  coopname: true,
  username: true,
  project_hash: true,
  blockchain_status: true,
  created_at: true,
  description: true,
  meta: true,
  display_name: true,
  amounts: rawCommitAmountsSelector,
  
  project: rawBaseProjectSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalCommit']> = rawCommitSelector

export type commitModel = ModelTypes['CapitalCommit']

export const commitSelector = Selector('CapitalCommit')(rawCommitSelector)
export { rawCommitSelector }
