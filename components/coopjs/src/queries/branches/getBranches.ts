import type { ValueTypes } from '../../types'
import type { GraphQLTypes, ModelTypes } from '../../zeus';
import { $, InputType, Selector } from '../../zeus';
import { extensionSelector } from '../../selectors/extensions/extensionSelector';
import { branchSelector } from '../../selectors';

/**
 * Извлекает кооперативные участки 
 */
export const getBranches = Selector("Query")({
  getBranches: [{data: $('data', 'GetBranchesInput!')}, branchSelector]
});
