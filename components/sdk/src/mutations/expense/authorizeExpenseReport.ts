import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'authorizeExpenseReport'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AuthorizeExpenseReportInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AuthorizeExpenseReportInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
