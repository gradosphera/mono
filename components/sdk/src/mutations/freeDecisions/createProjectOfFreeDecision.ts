import { createdProjectFreeDecisionSelector } from '../../selectors/decisions';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index';

export const name = 'createProjectOfFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateProjectFreeDecisionInput!')}, createdProjectFreeDecisionSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['CreateProjectFreeDecisionInput'],
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
