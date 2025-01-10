import { paymentMethodSelector, type paymentMethodModel } from '../../selectors/paymentMethods/paymentMethodSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'updateBankAccount'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'UpdateBankAccountInput!')}, paymentMethodSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['UpdateBankAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
