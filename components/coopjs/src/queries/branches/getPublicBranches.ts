import type { ValueTypes } from '../../types'
import type { GraphQLTypes, ModelTypes } from '../../zeus';
import { $, InputType, Selector } from '../../zeus';
import { extensionSelector } from '../../selectors/extensions/extensionSelector';
import { branchSelectorForUsers } from '../../selectors';

/**
 * Извлекает информацию о кооперативных участках для пользователя с ролью user
 */
export const getPublicBranches = Selector("Query")({
  getBranches: [{data: $('data', 'GetBranchesInput!')}, branchSelectorForUsers]
});


export type IPublicBranches = InputType<GraphQLTypes['Query'], typeof getPublicBranches>;

// Извлекаем тип одного элемента
export type IPublicBranch = IPublicBranches['getBranches'][number];