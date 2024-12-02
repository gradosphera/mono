import { paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector';
import { $, Selector, type ModelTypes } from '../../zeus';

export const deletePaymentMethod = Selector('Mutation')({
  deletePaymentMethod: [{data: $('data', 'DeletePaymentMethodInput!')}, true]
});

export type IDeleteBankAccountInput = ModelTypes['DeletePaymentMethodInput']
