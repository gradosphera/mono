import { accountSelector, participantApplicationDecisionDocumentSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index';

export const name = 'addParticipant'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'AddParticipantInput!')}, accountSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['AddParticipantInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
