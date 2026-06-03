import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'reportExpenseItem'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ReportExpenseItemInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ReportExpenseItemInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
