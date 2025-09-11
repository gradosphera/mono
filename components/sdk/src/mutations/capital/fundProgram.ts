import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalFundProgram'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'FundProgramInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['FundProgramInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
