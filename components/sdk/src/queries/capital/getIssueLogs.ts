import { logsPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getCapitalIssueLogs'

/**
 * Получение логов по задаче с пагинацией
 */
export const query = Selector('Query')({
  [name]: [
    {
      data: $('data', 'GetCapitalIssueLogsInput!'),
      options: $('options', 'PaginationInput'),
    },
    logsPaginationSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetCapitalIssueLogsInput']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
