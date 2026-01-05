import { logsPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getCapitalProjectLogs'

/**
 * Получение логов по проекту с фильтрацией и пагинацией
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetCapitalLogsInput!') }, logsPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetCapitalLogsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
