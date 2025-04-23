import type { GraphQLTypes, InputType, ModelTypes } from '../../zeus/index'
import { rawDocumentPackageSelector } from '../../selectors/documents/documentPackageSelector'
import { paginationSelector } from '../../utils/paginationSelector'
import { $, Selector } from '../../zeus/index'

const documentPaginationSelector = { ...paginationSelector, items: rawDocumentPackageSelector }
export const name = 'getDocuments'

/**
 * Извлекает методы платежа
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
