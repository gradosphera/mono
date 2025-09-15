import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

export const rawDeltaSelector = {
  block_id: true,
  block_num: true,
  chain_id: true,
  code: true,
  created_at: true,
  id: true,
  present: true,
  primary_key: true,
  scope: true,
  table: true,
  value: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['Delta']> = rawDeltaSelector

export const deltaSelector = Selector('Delta')(
  rawDeltaSelector,
)

export type DeltaModel = ValueTypes['Delta']
