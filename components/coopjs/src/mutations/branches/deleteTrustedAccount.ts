import { branchSelector, type branchModel } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['DeleteTrustedAccountInput']

export const name = 'deleteTrustedAccount'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'DeleteTrustedAccountInput!')}, branchSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

