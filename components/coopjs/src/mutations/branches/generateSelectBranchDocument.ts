import { generateSelectBranchDocumentSelector } from '../../selectors/branches/selectBranchDocumentSelector';
import { $, Selector, type ModelTypes } from '../../zeus';

export const generateSelectBranchDocument = Selector('Mutation')({
  generateSelectBranchDocument: [{data: $('data', 'SelectBranchGenerateDocumentInput!')}, generateSelectBranchDocumentSelector]
});

export type ISelectBranchDocument = ModelTypes['SelectBranchDocument']

export type IGenerateSelectBranchDocumentInput = ModelTypes['SelectBranchGenerateDocumentInput']
