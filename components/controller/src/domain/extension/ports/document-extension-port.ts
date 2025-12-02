import type { DocumentAction } from '~/domain/document/enums/document-action.enum';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';

/**
 * Интерфейс входных данных для извлечения документов через порт расширений
 */
export interface GetDocumentsExtensionInputInterface {
  /**
   * Тип извлекаемых документов
   * newsubmitted - документы ожидающие подтверждения
   * newresolved - утверждённые документы
   */
  type?: 'newsubmitted' | 'newresolved';

  /**
   * Массив типов действий для фильтрации
   */
  actions?: DocumentAction[];

  /**
   * Номер блока, начиная с которого извлекать документы
   */
  after_block?: number;

  /**
   * Номер блока, до которого извлекать документы
   */
  before_block?: number;

  /**
   * Номер страницы для пагинации
   */
  page?: number;

  /**
   * Количество записей на странице
   */
  limit?: number;

  /**
   * Дополнительные фильтры запроса
   */
  query?: Record<string, unknown>;
}

/**
 * Порт для доступа к документам из расширений
 * Предоставляет методы для извлечения пакетов документов
 */
export interface DocumentExtensionPort {
  /**
   * Получает агрегаты пакетов документов с пагинацией
   * @param data Параметры запроса
   * @returns Пагинированный результат с агрегатами пакетов документов
   */
  getDocumentsAggregate(
    data: GetDocumentsExtensionInputInterface
  ): Promise<PaginationResultDomainInterface<DocumentPackageAggregateDomainInterface>>;
}

export const DOCUMENT_EXTENSION_PORT = Symbol('DocumentExtensionPort');
