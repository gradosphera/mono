import { expensesPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalExpenses'

/**
 * Получение всех расходов с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'ExpenseFilter'), options: $('options', 'PaginationInput') }, expensesPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['ExpenseFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
