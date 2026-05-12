import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

/**
 * Поля платформенной оферты регистрации (плюс extension-зарегистрированные).
 * Соответствует `RegistrationAgreementDTO` controller'а.
 */
export const rawRegistrationAgreementSelector = {
  id: true,
  agreement_type: true,
  registry_id: true,
  title: true,
  checkbox_text: true,
  link_text: true,
  is_blockchain_agreement: true,
  link_to_statement: true,
  applicable_account_types: true,
  order: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['RegistrationAgreement']> = rawRegistrationAgreementSelector

export const registrationAgreementSelector = Selector('RegistrationAgreement')(rawRegistrationAgreementSelector)
