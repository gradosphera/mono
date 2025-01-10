import { participantApplicationDecisionDocumentSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'generateParticipantApplicationDecision'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ParticipantApplicationDecisionGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput!')}, participantApplicationDecisionDocumentSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['ParticipantApplicationDecisionGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput'];
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
