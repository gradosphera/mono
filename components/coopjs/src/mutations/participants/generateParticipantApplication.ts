import { participantApplicationDocumentSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['ParticipantApplicationGenerateDocumentInput']

export const name = 'generateParticipantApplication'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ParticipantApplicationGenerateDocumentInput!')}, participantApplicationDocumentSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

