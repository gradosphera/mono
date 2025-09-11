import { debtSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalDebt'

/**
 * Получение долга по ID
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetDebtInput!') }, debtSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetDebtInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
