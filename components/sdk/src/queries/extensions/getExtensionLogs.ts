import { paginatedExtensionLogsSelector } from '../../selectors/extensions/paginatedExtensionLogsSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getExtensionLogs'

/**
 * Извлекает логи расширений с фильтрацией и пагинацией
 */
export const query = Selector('Query')({
  [name]: [
    {
      data: $('data', 'GetExtensionLogsInput'),
      options: $('options', 'PaginationInput'),
    },
    paginatedExtensionLogsSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data?: ModelTypes['GetExtensionLogsInput']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
