import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

export const rawCurrentTableStateSelector = {
  block_num: true,
  code: true,
  created_at: true,
  primary_key: true,
  scope: true,
  table: true,
  value: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CurrentTableState']> = rawCurrentTableStateSelector

export const currentTableStateSelector = Selector('CurrentTableState')(
  rawCurrentTableStateSelector,
)

export type CurrentTableStateModel = ValueTypes['CurrentTableState']
