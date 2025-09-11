import { programInvestSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalProgramInvest'

/**
 * Получение программной инвестиции по ID
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetProgramInvestInput!') }, programInvestSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetProgramInvestInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
