import type { DocumentAction } from '~/domain/document/enums/document-action.enum';

/**
 * Интерфейс входных данных для извлечения документов через порт расширений
 */
export interface GetDocumentsDataInputInterface {
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
