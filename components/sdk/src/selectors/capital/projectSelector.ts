import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawBaseProjectSelector = {
  _id: true,
  id: true,
  block_num: true,
  present: true,
  status: true,
  project_hash: true,
  coopname: true,
  parent_hash: true,
  blockchain_status: true,
  is_opened: true,
  is_planed: true,
  can_convert_to_project: true,
  master: true,
  title: true,
  description: true,
  meta: true,
  created_at: true,
}

const rawProjectSelector = {
  ...rawBaseProjectSelector,
  components: rawBaseProjectSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalProject']> = rawProjectSelector

export type projectModel = ModelTypes['CapitalProject']

export const projectSelector = Selector('CapitalProject')(rawProjectSelector)
export { rawProjectSelector }
