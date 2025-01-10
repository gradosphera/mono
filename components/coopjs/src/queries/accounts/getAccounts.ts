import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from "../../zeus";
import { accountsPaginationSelector } from "../../selectors/accounts/accountsSelector";

export const name = 'getAccounts'

/**
 * Извлекает комплексную информацию о аккаунтах с постраничным отображением
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetAccountsInput!'), options: $('options', 'PaginationInput!')}, accountsPaginationSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data?: ModelTypes['GetAccountsInput'],
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
