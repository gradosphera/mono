import { investSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalInvest'

/**
 * Получение инвестиции по ID
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetInvestInput!') }, investSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetInvestInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
