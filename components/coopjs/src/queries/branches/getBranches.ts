import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';
import { branchSelector } from '../../selectors';

type inputModel = ModelTypes['GetBranchesInput']

export const name = 'getBranches'

/**
 * Извлекает подробную информацию о кооперативных участках
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetBranchesInput!')}, branchSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;

