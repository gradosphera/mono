import { timeEntriesPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalTimeEntries'

/**
 * Получение пагинированного списка записей времени
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'CapitalTimeEntriesFilter'), options: $('options', 'PaginationInput') }, timeEntriesPaginationSelector],
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
