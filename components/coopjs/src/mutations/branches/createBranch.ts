import { branchSelector, type branchModel } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['CreateBranchInput']

export const name = 'createBranch'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'CreateBranchInput!')}, branchSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;