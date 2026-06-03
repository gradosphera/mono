import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'declineExpenseReport'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeclineExpenseReportInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeclineExpenseReportInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
