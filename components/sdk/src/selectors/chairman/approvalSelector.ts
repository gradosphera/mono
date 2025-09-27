import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentAggregateSelector } from '../documents'

const rawApprovalSelector = {
  _id: true,
  _created_at: true,
  _updated_at: true,
  id: true,
  block_num: true,
  present: true,
  status: true,
  approval_hash: true,
  coopname: true,
  username: true,
  callback_contract: true,
  callback_action_approve: true,
  callback_action_decline: true,
  document: rawDocumentAggregateSelector,
  approved_document: rawDocumentAggregateSelector,
  meta: true,
  created_at: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['Approval']> = rawApprovalSelector

export type approvalModel = ModelTypes['Approval']

export const approvalSelector = Selector('Approval')(rawApprovalSelector)
export { rawApprovalSelector }
