import type { GraphQLTypes, ModelTypes } from '../../zeus';
import { $, InputType, Selector } from '../../zeus';
import { branchSelectorForUsers } from '../../selectors';

type inputModel = ModelTypes['GetBranchesInput']

export const name = 'getBranches'

/**
 * Извлекает информацию о кооперативных участках для пользователя с ролью user
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetBranchesInput!')}, branchSelectorForUsers]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
