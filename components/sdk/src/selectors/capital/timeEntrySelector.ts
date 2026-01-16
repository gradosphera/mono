import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawTimeEntrySelector = {
  _id: true,
  contributor_hash: true,
  issue_hash: true,
  project_hash: true,
  coopname: true,
  date: true,
  hours: true,
  commit_hash: true,
  is_committed: true,
  estimate_snapshot: true,
  entry_type: true,
  _created_at: true,
  _updated_at: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalTimeEntry']> = rawTimeEntrySelector

export type timeEntryModel = ModelTypes['CapitalTimeEntry']

export const timeEntrySelector = Selector('CapitalTimeEntry')(rawTimeEntrySelector)
export { rawTimeEntrySelector }
