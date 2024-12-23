import { paymentMethodSelector, type paymentMethodModel } from '../../selectors/paymentMethods/paymentMethodSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['UpdateBankAccountInput']
export const name = 'updateBankAccount'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'UpdateBankAccountInput!')}, paymentMethodSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
