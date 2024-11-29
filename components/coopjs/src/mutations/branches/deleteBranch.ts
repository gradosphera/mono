import { $, Selector, type ModelTypes } from '../../zeus';

export const deleteBranch = Selector('Mutation')({
  deleteBranch: [{data: $('data', 'DeleteBranchInput!')}, true]
});

export type IDeleteBranchInput = ModelTypes['DeleteBranchInput']
