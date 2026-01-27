import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { documentSelector } from '../common'

export const rawGenerateCapitalRegistrationDocumentsOutputSelector = {
  generation_contract: documentSelector,
  storage_agreement: documentSelector,
  blagorost_agreement: documentSelector,
  generator_offer: documentSelector,
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['GenerateCapitalRegistrationDocumentsOutputDTO']>
= rawGenerateCapitalRegistrationDocumentsOutputSelector

// Передаём raw в селектор
export const generateCapitalRegistrationDocumentsOutputSelector = Selector('GenerateCapitalRegistrationDocumentsOutputDTO')(rawGenerateCapitalRegistrationDocumentsOutputSelector)