import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'

const rawResultSelector = {
  _id: true,
  id: true,
  block_num: true,
  present: true,
  status: true,
  result_hash: true,
  project_hash: true,
  coopname: true,
  username: true,
  blockchain_status: true,
  created_at: true,
  debt_amount: true,
  total_amount: true,
  statement: rawDocumentAggregateSelector,
  authorization: rawDocumentAggregateSelector,
  act: rawDocumentAggregateSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalResult']> = rawResultSelector

export type resultModel = ModelTypes['CapitalResult']

export const resultSelector = Selector('CapitalResult')(rawResultSelector)
export { rawResultSelector }
