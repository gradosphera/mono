import { configSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalConfig'

/**
 * Получение конфигурации CAPITAL контракта
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetCapitalConfigInput!') }, configSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetCapitalConfigInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
