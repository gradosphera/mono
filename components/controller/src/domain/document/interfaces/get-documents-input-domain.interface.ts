import { DocumentAction } from '../enums/document-action.enum';

export interface GetDocumentsInputDomainInterface {
  type?: 'newsubmitted' | 'newresolved';
  query: Record<string, unknown>;
  page?: number;
  limit?: number;
  after_block?: number;
  before_block?: number;
  /**
   * Массив типов действий для фильтрации по полю data.action.
   * Используется оператор $in для выборки документов с указанными действиями.
   */
  actions?: DocumentAction[];
}
