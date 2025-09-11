import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'

const rawContributorSelector = {
  _id: true,
  id: true,
  block_num: true,
  present: true,
  status: true,
  contributor_hash: true,
  coopname: true,
  username: true,
  blockchain_status: true,
  memo: true,
  is_external_contract: true,
  rate_per_hour: true,
  debt_amount: true,
  contributed_as_investor: true,
  contributed_as_creator: true,
  contributed_as_author: true,
  contributed_as_coordinator: true,
  contributed_as_contributor: true,
  contributed_as_propertor: true,
  created_at: true,
  contract: rawDocumentAggregateSelector,
  appendixes: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalContributor']> = rawContributorSelector

export type contributorModel = ModelTypes['CapitalContributor']

export const contributorSelector = Selector('CapitalContributor')(rawContributorSelector)
export { rawContributorSelector }
