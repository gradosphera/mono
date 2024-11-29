import { branchSelector } from '../../selectors';
import type { ValueTypes } from '../../types'
import { $, Selector } from '../../zeus';

export const editBranch = Selector('Mutation')({
  editBranch: [{data: $('data', 'EditBranchInput!')}, branchSelector]
});

export type IEditBranchInput = ValueTypes['EditBranchInput']
