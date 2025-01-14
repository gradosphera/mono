import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['DeleteBranchInput']

export const name = 'deleteBranch'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'DeleteBranchInput!')}, true]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['DeleteBranchInput'],
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
