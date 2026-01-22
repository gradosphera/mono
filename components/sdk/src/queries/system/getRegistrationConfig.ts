import { registrationConfigSelector } from '../../selectors/system/registrationConfigSelector'
import { $, type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'getRegistrationConfig'

/**
 * Получить конфигурацию программ регистрации для кооператива
 */
export const query = Selector('Query')({
  [name]: [
    {
      coopname: $('coopname', 'String!'),
      account_type: $('account_type', 'AccountType!'),
    },
    registrationConfigSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  coopname: string
  account_type: GraphQLTypes['AccountType']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
