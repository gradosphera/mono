import { branchSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getBranches'

/**
 * Извлекает подробную информацию о кооперативных участках
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetBranchesInput!') }, branchSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetBranchesInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
