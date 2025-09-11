import { expenseSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalExpense'

/**
 * Получение расхода по ID
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetExpenseInput!') }, expenseSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetExpenseInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
