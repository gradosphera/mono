import { paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector';
import { $, Selector, type ModelTypes } from '../../zeus';

export const createBankAccount = Selector('Mutation')({
  createBankAccount: [{data: $('data', 'CreateBankAccountInput!')}, paymentMethodSelector]
});

export type ICreateBankAccountInput = ModelTypes['CreateBankAccountInput']
