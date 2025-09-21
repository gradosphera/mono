import { flexibleTimeStatsSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalTimeStats'

/**
 * Гибкий запрос статистики времени с пагинацией
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'CapitalTimeStatsInput'), options: $('options', 'PaginationInput') }, flexibleTimeStatsSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data?: ModelTypes['CapitalTimeStatsInput']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
