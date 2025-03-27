import { paymentSelector } from '../../selectors/payments';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index';

export const name = 'createDepositPayment'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'CreateDepositPaymentInput!')}, paymentSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['CreateDepositPaymentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
