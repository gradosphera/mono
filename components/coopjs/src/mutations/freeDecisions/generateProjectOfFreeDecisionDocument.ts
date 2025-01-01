import { projectFreeDecisionDocumentSelector } from '../../selectors/decisions/freeDecisionDocumentSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['ProjectFreeDecisionGenerateDocumentInput'];

export const name = 'generateProjectOfFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ProjectFreeDecisionGenerateDocumentInput!')}, projectFreeDecisionDocumentSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

