import { segmentsPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalSegments'

/**
 * Получение всех сегментов с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'CapitalSegmentFilter'), options: $('options', 'PaginationInput') }, segmentsPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['CapitalSegmentFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
