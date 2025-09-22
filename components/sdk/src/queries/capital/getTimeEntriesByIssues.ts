import { timeEntriesByIssuesPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalTimeEntriesByIssues'

/**
 * Получение пагинированного списка агрегированных записей времени по задачам
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'CapitalTimeEntriesFilter'), options: $('options', 'PaginationInput') }, timeEntriesByIssuesPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['CapitalTimeEntriesFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
