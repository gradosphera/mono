import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawIssueSelector = {
  _id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  estimate: true,
  sort_order: true,
  created_by: true,
  submaster_id: true,
  creators_ids: true,
  project_hash: true,
  cycle_id: true,
  metadata: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalIssue']> = rawIssueSelector

export type issueModel = ModelTypes['CapitalIssue']

export const issueSelector = Selector('CapitalIssue')(rawIssueSelector)
export { rawIssueSelector }
