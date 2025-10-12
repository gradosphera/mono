import { segmentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalSegment'

/**
 * Получение одного сегмента по фильтрам
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'CapitalSegmentFilter') }, segmentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['CapitalSegmentFilter']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
