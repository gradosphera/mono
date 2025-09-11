import { commitsPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCommits'

/**
 * Получение всех коммитов с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'CapitalCommitFilter'), options: $('options', 'PaginationInput') }, commitsPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['CapitalCommitFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
