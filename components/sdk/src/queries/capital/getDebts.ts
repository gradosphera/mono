import { debtsPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalDebts'

/**
 * Получение всех долгов с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'DebtFilter'), options: $('options', 'PaginationInput') }, debtsPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['DebtFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
