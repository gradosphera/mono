import type {GraphQLTypes, InputType, ModelTypes } from '../../zeus';
import { $, Selector } from '../../zeus';
import { rawPaymentMethodPaginationSelector } from '../../selectors/paymentMethods/paginatedPaymentMethodsSelector';

const name = 'getPaymentMethods'

/**
 * Извлекает методы платежа
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetPaymentMethodsInput')}, rawPaymentMethodPaginationSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['GetPaymentMethodsInput'],
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
