import { documentSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['GenerateDocumentInput']

export const name = 'generateWalletAgreement'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'GenerateDocumentInput!')}, documentSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

