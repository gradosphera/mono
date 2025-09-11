import { storiesPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalStories'

/**
 * Получение всех историй с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'CapitalStoryFilter'), options: $('options', 'PaginationInput') }, storiesPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['CapitalStoryFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
