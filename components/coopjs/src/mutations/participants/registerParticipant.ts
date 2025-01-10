import { accountSelector, participantApplicationDecisionDocumentSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'registerParticipant'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'RegisterParticipantInput!')}, accountSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['RegisterParticipantInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
