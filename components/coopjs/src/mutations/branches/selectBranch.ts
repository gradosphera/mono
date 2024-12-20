import { $, Selector, type ModelTypes } from '../../zeus';

export const selectBranch = Selector('Mutation')({
  selectBranch: [{data: $('data', 'SelectBranchInput!')}, true]
});

export type ISelectBranchInput = ModelTypes['SelectBranchInput']
