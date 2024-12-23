import { generateSelectBranchDocumentSelector } from '../../selectors/branches/selectBranchDocumentSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['SelectBranchDocument']

export const name = 'generateSelectBranchDocument'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'SelectBranchGenerateDocumentInput!')}, generateSelectBranchDocumentSelector]
});


export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
