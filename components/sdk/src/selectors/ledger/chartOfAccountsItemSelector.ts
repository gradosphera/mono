import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawChartOfAccountsItemSelector = {
  id: true,
  displayId: true,
  name: true,
  available: true,
  blocked: true,
  writeoff: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['ChartOfAccountsItem']> = rawChartOfAccountsItemSelector

export type chartOfAccountsItemModel = ModelTypes['ChartOfAccountsItem']

export const chartOfAccountsItemSelector = Selector('ChartOfAccountsItem')(rawChartOfAccountsItemSelector)
export { rawChartOfAccountsItemSelector } 