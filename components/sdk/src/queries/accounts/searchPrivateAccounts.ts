import { privateAccountSearchResultSelector } from '../../selectors/accounts/searchPrivateAccountsResult'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'searchPrivateAccounts'

/**
 * Поиск приватных данных аккаунтов по запросу
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'SearchPrivateAccountsInput!') }, privateAccountSearchResultSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SearchPrivateAccountsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
