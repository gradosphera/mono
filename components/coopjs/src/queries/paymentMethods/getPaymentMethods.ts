import type {GraphQLTypes, InputType, ModelTypes } from '../../zeus';
import { $, Selector } from '../../zeus';
import { rawPaymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector';
import { paginationSelector } from '../../utils/paginationSelector';

type inputModel = ModelTypes['GetPaymentMethodsInput']


const paymentMethodPaginationSelector = {...paginationSelector, items: rawPaymentMethodSelector};
const name = 'getPaymentMethods'

/**
 * Извлекает методы платежа
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetPaymentMethodsInput')}, paymentMethodPaginationSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
