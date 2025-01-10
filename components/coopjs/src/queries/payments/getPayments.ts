import type {GraphQLTypes, InputType, ModelTypes } from '../../zeus';
import { $, Selector } from '../../zeus';
import { paginationSelector } from '../../utils/paginationSelector';
import { rawPaymentSelector } from '../../selectors/payments';

const paymentPaginationSelector = {...paginationSelector, items: rawPaymentSelector};
const name = 'getPayments'

/**
 * Извлекает платежи
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetPaymentsInput')}, paymentPaginationSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['GetPaymentsInput'],
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
