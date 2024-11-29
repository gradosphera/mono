import { branchSelector } from '../../selectors';
import { $, Selector, type ModelTypes } from '../../zeus';

export const createBranch = Selector('Mutation')({
  createBranch: [{data: $('data', 'CreateBranchInput!')}, branchSelector]
});

export type ICreateBranchInput = ModelTypes['CreateBranchInput']
