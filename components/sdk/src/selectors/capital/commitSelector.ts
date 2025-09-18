import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { baseCapitalSelector } from './baseCapitalSelector'

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
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalCommit']> = rawCommitSelector

export type commitModel = ModelTypes['CapitalCommit']

export const commitSelector = Selector('CapitalCommit')(rawCommitSelector)
export { rawCommitSelector }
