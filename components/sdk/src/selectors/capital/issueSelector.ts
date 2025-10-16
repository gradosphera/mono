import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { baseCapitalSelector } from './baseCapitalSelector'

// Селектор для прав доступа к задаче
const rawIssuePermissionsSelector = {
  can_edit_issue: true,
  can_change_status: true,
  can_set_done: true,
  can_set_on_review: true,
  can_delete_issue: true,
  has_clearance: true,
  is_guest: true,
}

const rawIssueSelector = {
  ...baseCapitalSelector,
  id: true,
  issue_hash: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  estimate: true,
  sort_order: true,
  created_by: true,
  submaster: true,
  creators: true,
  project_hash: true,
  cycle_id: true,
  metadata: true,
  permissions: rawIssuePermissionsSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalIssue']> = rawIssueSelector

export type issueModel = ModelTypes['CapitalIssue']

export const issueSelector = Selector('CapitalIssue')(rawIssueSelector)
export { rawIssueSelector, rawIssuePermissionsSelector }
