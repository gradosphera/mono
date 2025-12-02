import type { GraphQLTypes, InputType, ModelTypes } from '../../zeus/index'
import { oneCoopDocumentsPaginationSelector } from '../../selectors/onecoop/oneCoopDocumentsPaginationSelector'
import { $, Selector } from '../../zeus/index'

export const name = 'onecoopGetDocuments'

/**
 * Извлекает документы кооператива для синхронизации с 1С
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetOneCoopDocumentsInput!') }, oneCoopDocumentsPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetOneCoopDocumentsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
