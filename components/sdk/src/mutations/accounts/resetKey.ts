import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index';

export const name = 'resetKey'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ResetKeyInput!')}, true]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['ResetKeyInput'],
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
