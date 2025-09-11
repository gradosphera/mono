import { resultsPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalResults'

/**
 * Получение всех результатов с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'ResultFilter'), options: $('options', 'PaginationInput') }, resultsPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['ResultFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
