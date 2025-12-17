import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { documentSelector } from '../common/documentSelector'

export const rawGeneratedRegistrationDocumentSelector = {
  id: true,
  agreement_type: true,
  title: true,
  checkbox_text: true,
  link_text: true,
  document: documentSelector,
  is_blockchain_agreement: true,
  link_to_statement: true,
  order: true,
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['GeneratedRegistrationDocument']> = rawGeneratedRegistrationDocumentSelector

// Передаём raw в селектор
export const generatedRegistrationDocumentSelector = Selector('GeneratedRegistrationDocument')(rawGeneratedRegistrationDocumentSelector)
