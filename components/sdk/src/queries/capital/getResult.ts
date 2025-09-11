import { resultSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalResult'

/**
 * Получение результата по ID
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetResultInput!') }, resultSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetResultInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
