import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { generatedRegistrationDocumentSelector } from './generatedRegistrationDocument.selector'

export const rawGenerateRegistrationDocumentsOutputSelector = {
  documents: generatedRegistrationDocumentSelector,
  account_type: true,
  username: true,
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['GenerateRegistrationDocumentsOutput']> = rawGenerateRegistrationDocumentsOutputSelector

// Передаём raw в селектор
export const generateRegistrationDocumentsOutputSelector = Selector('GenerateRegistrationDocumentsOutput')(rawGenerateRegistrationDocumentsOutputSelector)
