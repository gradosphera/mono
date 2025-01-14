import { systemInfoSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'updateSystem'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'Update!')}, systemInfoSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['Update']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
