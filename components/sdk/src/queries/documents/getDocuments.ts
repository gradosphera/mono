import type {GraphQLTypes, InputType, ModelTypes } from '../../zeus/index';
import { $, Selector } from '../../zeus/index';
import { paginationSelector } from '../../utils/paginationSelector';
import { rawDocumentPackageSelector } from '../../selectors/documents/documentPackageSelector';

const documentPaginationSelector = {...paginationSelector, items: rawDocumentPackageSelector};
const name = 'getDocuments'

/**
 * Извлекает методы платежа
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetDocumentsInput')}, documentPaginationSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['GetDocumentsInput'],
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
