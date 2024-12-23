import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['SelectBranchInput']

export const name = 'selectBranch'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'SelectBranchInput!')}, true]
});


export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
