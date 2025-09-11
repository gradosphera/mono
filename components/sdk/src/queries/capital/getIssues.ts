import { issuesPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalIssues'

/**
 * Получение всех задач с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'CapitalIssueFilter'), options: $('options', 'PaginationInput') }, issuesPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['CapitalIssueFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
