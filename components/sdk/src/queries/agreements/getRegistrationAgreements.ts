import { rawRegistrationAgreementSelector } from '../../selectors/agreements/registrationAgreementSelector'
import { $, type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'getRegistrationAgreements'

/**
 * Список оферт регистрации для типа аккаунта (и опционально программы).
 *
 * Сливает платформенные базовые оферты (signature/wallet/user/privacy)
 * с теми, что зарегистрировали расширения через AgreementRegistry —
 * UI получает один однородный список, отсортированный по `order`.
 */
export const query = Selector('Query')({
  [name]: [
    {
      coopname: $('coopname', 'String!'),
      account_type: $('account_type', 'AccountType!'),
      program_key: $('program_key', 'String'),
    },
    rawRegistrationAgreementSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  coopname: string
  account_type: GraphQLTypes['AccountType']
  program_key?: string | null
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
