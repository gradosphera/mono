import { cyclesPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCycles'

/**
 * Получение всех циклов с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'CapitalCycleFilter'), options: $('options', 'PaginationInput') }, cyclesPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['CapitalCycleFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
