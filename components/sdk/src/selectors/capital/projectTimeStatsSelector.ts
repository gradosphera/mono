import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawProjectTimeStatsSelector = {
  project_hash: true,
  project_name: true,
  contributor_hash: true,
  total_committed_hours: true,
  total_uncommitted_hours: true,
  available_hours: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalProjectTimeStats']> = rawProjectTimeStatsSelector

export type projectTimeStatsModel = ModelTypes['CapitalProjectTimeStats']

export const projectTimeStatsSelector = Selector('CapitalProjectTimeStats')(rawProjectTimeStatsSelector)
export { rawProjectTimeStatsSelector }
