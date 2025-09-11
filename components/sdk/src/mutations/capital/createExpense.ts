import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateExpense'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateExpenseInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateExpenseInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
