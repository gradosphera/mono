import { registeredAccountSelector } from '../../selectors/accounts/registeredAccountSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';



export const name = 'registerAccount'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'RegisterAccountInput!')}, registeredAccountSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['RegisterAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
