import { accountSelector } from '../../selectors/accounts'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getAccount'

/**
 * Извлекает комплексную информацию о аккаунте
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetAccountInput!') }, accountSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
