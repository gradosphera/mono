import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getMeet'

/**
 * Получить данные собрания по хешу
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetMeetInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
