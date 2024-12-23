import { paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['DeletePaymentMethodInput']
export const name = 'deletePaymentMethod'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'DeletePaymentMethodInput!')}, true]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

