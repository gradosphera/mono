import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawCycleSelector = {
  _id: true,
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
