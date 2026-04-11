import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateProgramInvest'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateProgramInvestInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateProgramInvestInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
