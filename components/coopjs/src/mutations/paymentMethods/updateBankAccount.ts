import { paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector';
import { $, Selector, type ModelTypes } from '../../zeus';

export const updateBankAccount = Selector('Mutation')({
  updateBankAccount: [{data: $('data', 'UpdateBankAccountInput!')}, paymentMethodSelector]
});

export type IUpdateBankAccountInput = ModelTypes['UpdateBankAccountInput']
