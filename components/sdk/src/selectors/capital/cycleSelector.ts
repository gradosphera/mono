import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { baseCapitalSelector } from './baseCapitalSelector'

const rawCycleSelector = {
  ...baseCapitalSelector,
  name: true,
  start_date: true,
  end_date: true,
  status: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalCycle']> = rawCycleSelector

export type cycleModel = ModelTypes['CapitalCycle']

export const cycleSelector = Selector('CapitalCycle')(rawCycleSelector)
export { rawCycleSelector }
