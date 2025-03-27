import { accountsPaginationSelector } from '../../selectors/accounts/accountsSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getAccounts'

/**
 * Извлекает комплексную информацию о аккаунтах с постраничным отображением
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetAccountsInput'), options: $('options', 'PaginationInput') }, accountsPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data?: ModelTypes['GetAccountsInput']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
