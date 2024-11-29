import type { ValueTypes } from '../../types'
import type { GraphQLTypes, ModelTypes } from '../../zeus';
import { $, InputType, Selector } from '../../zeus';
import { extensionSelector } from '../../selectors/extensions/extensionSelector';
import { branchSelector } from '../../selectors';
import { paymentMethodSelector, rawPaymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector';
import { paginationSelector } from '../../utils/paginationSelector';

const paymentMethodPaginationSelector = {...paginationSelector, items: rawPaymentMethodSelector};

/**
 * Извлекает методы платежа
 */
export const getPaymentMethods = Selector("Query")({
  getPaymentMethods: [{data: $('data', 'GetPaymentMethodsInput')}, paymentMethodPaginationSelector]
});

export type IGetPaymentMethodsInput = ValueTypes['GetPaymentMethodsInput']
