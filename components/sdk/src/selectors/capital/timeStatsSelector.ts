import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawProjectTimeStatsSelector } from './projectTimeStatsSelector'

const rawTimeStatsSelector = {
  items: rawProjectTimeStatsSelector,
  totalCount: true,
  currentPage: true,
  totalPages: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalTimeStats']> = rawTimeStatsSelector

export type flexibleTimeStatsModel = ModelTypes['CapitalTimeStats']

export const flexibleTimeStatsSelector = Selector('CapitalTimeStats')(rawTimeStatsSelector)
export { rawTimeStatsSelector }
