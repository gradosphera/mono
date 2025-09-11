import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawStorySelector = {
  _id: true,
  title: true,
  description: true,
  status: true,
  project_hash: true,
  issue_id: true,
  created_by: true,
  sort_order: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalStory']> = rawStorySelector

export type storyModel = ModelTypes['CapitalStory']

export const storySelector = Selector('CapitalStory')(rawStorySelector)
export { rawStorySelector }
