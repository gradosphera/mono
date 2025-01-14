import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'startResetKey'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'StartResetKeyInput!')}, true]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['StartResetKeyInput'],
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
