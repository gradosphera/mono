import { paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'deletePaymentMethod'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'DeletePaymentMethodInput!')}, true]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['DeletePaymentMethodInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

