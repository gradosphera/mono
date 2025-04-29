import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getMeets'

/**
 * Получить список всех собраний кооператива
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetMeetsInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetMeetsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
