import { paymentMethodSelector, type paymentMethodModel } from '../../selectors/paymentMethods/paymentMethodSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'createBankAccount'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'CreateBankAccountInput!')}, paymentMethodSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['CreateBankAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
