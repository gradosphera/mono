import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index';

export const name = 'publishProjectOfFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'PublishProjectFreeDecisionInput!')}, true]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['PublishProjectFreeDecisionInput'],
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
