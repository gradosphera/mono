import type { GraphQLTypes, InputType, ModelTypes } from '../../zeus/index'
import { rawDocumentPackageAggregateSelector } from '../../selectors/agenda/documentPackageAggregateSelector'
import { paginationSelector } from '../../utils/paginationSelector'
import { $, Selector } from '../../zeus/index'

const documentPaginationSelector = { ...paginationSelector, items: rawDocumentPackageAggregateSelector }
export const name = 'getDocuments'

/**
 * Извлекает документы с агрегатами
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetDocumentsInput!') }, documentPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetDocumentsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
