import { branchSelector } from '../../selectors';
import { $, Selector, type ModelTypes } from '../../zeus';

export const addTrustedAccount = Selector('Mutation')({
  addTrustedAccount: [{data: $('data', 'AddTrustedAccountInput!')}, branchSelector]
});

export type IAddTrustedAccountInput = ModelTypes['AddTrustedAccountInput']
