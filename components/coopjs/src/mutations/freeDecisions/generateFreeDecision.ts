import { projectFreeDecisionDocumentSelector } from '../../selectors/decisions/freeDecisionDocumentSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['FreeDecisionGenerateDocumentInput']

export const name = 'generateFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'FreeDecisionGenerateDocumentInput!')}, projectFreeDecisionDocumentSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

