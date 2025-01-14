import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'deleteAccount'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'DeleteAccountInput!')}, true]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;
  data: ModelTypes['DeleteAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
