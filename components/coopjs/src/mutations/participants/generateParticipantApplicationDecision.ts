import { participantApplicationDecisionDocumentSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['ParticipantApplicationDecisionGenerateDocumentInput']

export const name = 'generateParticipantApplicationDecision'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ParticipantApplicationDecisionGenerateDocumentInput!')}, participantApplicationDecisionDocumentSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
