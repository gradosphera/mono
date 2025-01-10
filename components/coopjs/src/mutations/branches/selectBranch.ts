import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'selectBranch'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'SelectBranchInput!')}, true]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['SelectBranchInput'],
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
