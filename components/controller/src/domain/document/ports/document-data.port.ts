import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';
import type { GetDocumentsDataInputInterface } from '~/domain/document/interfaces/get-documents-data-input-domain.interface';

/**
 * Доменный порт для получения данных документов
 * Используется расширениями для доступа к данным документов
 */
export interface DocumentDataPort {
  /**
   * Получает агрегаты пакетов документов с пагинацией
   * @param data Параметры запроса
   * @returns Пагинированный результат с агрегатами пакетов документов
   */
  getDocumentsAggregate(
    data: GetDocumentsDataInputInterface
  ): Promise<PaginationResultDomainInterface<DocumentPackageAggregateDomainInterface>>;
}

export const DOCUMENT_DATA_PORT = Symbol('DocumentDataPort');
