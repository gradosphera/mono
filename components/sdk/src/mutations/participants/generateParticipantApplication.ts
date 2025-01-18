import { participantApplicationDocumentSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'generateParticipantApplication'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ParticipantApplicationGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput')}, participantApplicationDocumentSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['ParticipantApplicationGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput'];
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

