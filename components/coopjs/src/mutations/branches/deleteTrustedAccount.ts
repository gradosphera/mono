import { branchSelector } from '../../selectors';
import type { ValueTypes } from '../../types'
import { $, Selector } from '../../zeus';

export const deleteTrustedAccount = Selector('Mutation')({
  deleteTrustedAccount: [{data: $('data', 'DeleteTrustedAccountInput!')}, branchSelector]
});

export type IDeleteTrustedAccountInput = ValueTypes['DeleteTrustedAccountInput']
