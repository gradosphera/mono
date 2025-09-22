import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawTimeEntriesByIssuesSelector = {
  issue_hash: true,
  issue_title: true,
  project_hash: true,
  project_name: true,
  contributor_hash: true,
  contributor_name: true,
  coopname: true,
  total_hours: true,
  committed_hours: true,
  uncommitted_hours: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalTimeEntriesByIssues']> = rawTimeEntriesByIssuesSelector

export type timeEntriesByIssuesModel = ModelTypes['CapitalTimeEntriesByIssues']

export const timeEntriesByIssuesSelector = Selector('CapitalTimeEntriesByIssues')(rawTimeEntriesByIssuesSelector)
export { rawTimeEntriesByIssuesSelector }
