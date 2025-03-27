import type { GraphQLTypes, ModelTypes } from '../../zeus/index';
import { $, InputType, Selector } from '../../zeus/index';
import { branchSelectorForUsers } from '../../selectors';

export const name = 'getBranches'

/**
 * Извлекает информацию о кооперативных участках для пользователя с ролью user
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetBranchesInput!')}, branchSelectorForUsers]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['GetBranchesInput'],
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
