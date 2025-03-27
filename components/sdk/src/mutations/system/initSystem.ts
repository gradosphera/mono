import { systemInfoSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index';

export const name = 'initSystem'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'Init!')}, systemInfoSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['Init']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
