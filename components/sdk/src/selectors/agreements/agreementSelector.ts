import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { documentAggregateSelector } from '../documents'

export const rawAgreementSelector = {
  _id: true,
  present: true,
  block_num: true,
  _created_at: true,
  _updated_at: true,
  id: true,
  coopname: true,
  username: true,
  type: true,
  program_id: true,
  draft_id: true,
  version: true,
  status: true,
  document: documentAggregateSelector,
  updated_at: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['Agreement']> = rawAgreementSelector

export const agreementSelector = Selector('Agreement')(rawAgreementSelector)
