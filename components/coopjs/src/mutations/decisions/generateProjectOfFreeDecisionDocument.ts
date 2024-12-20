import { generateProjectOfFreeDecisionSelector } from '../../selectors/decisions/freeDecisionDocumentSelector';
import { $, Selector, type ModelTypes } from '../../zeus';

export const generateProjectOfFreeDecisionDocument = Selector('Mutation')({
  generateProjectOfFreeDecision: [{data: $('data', 'ProjectFreeDecisionGenerateDocumentInput!')}, generateProjectOfFreeDecisionSelector]
});

export type IProjectFreeDecisionDocument = ModelTypes['ProjectFreeDecisionDocument']

export type IGenerateProjeftOfFreeDecisionDocumentInput = ModelTypes['ProjectFreeDecisionGenerateDocumentInput']
