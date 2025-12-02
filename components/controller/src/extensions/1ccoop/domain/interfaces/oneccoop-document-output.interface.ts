import type { OneCoopDocumentAction } from '../enums/oneccoop-document-action.enum';

/**
 * Базовый интерфейс для выходных данных документа 1CCoop
 * Общая структура для всех типов документов, передаваемых в 1С
 */
export interface OneCoopDocumentOutputInterface<T = unknown> {
  /**
   * Тип действия документа
   */
  action: OneCoopDocumentAction;

  /**
   * Номер блока, в котором документ был зафиксирован
   */
  block_num: number;

  /**
   * SHA-256 хеш пакета документов
   */
  package: string;

  /**
   * SHA-256 хеш основного документа
   */
  hash: string;

  /**
   * Специфичные данные для конкретного типа действия
   */
  data: T;
}
