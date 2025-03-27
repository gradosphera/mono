import type { ModelTypes } from '../../zeus/index'

/**
 * Интерфейс для метаданных документа.
 */
export type IMetaDocument = ModelTypes['MetaDocument'] & {
  [key: string]: any
}

/**
 * Интерфейс для сгенерированного документа, который требуется подписать.
 */
export interface IGeneratedDocument<T = any> {
  full_title: string // Полное название документа
  html: string // HTML-содержимое документа
  hash: string // Хэш документа
  meta: IMetaDocument & T // Метаданные документа
  binary: string // Бинарные данные документа
}

/**
 * Интерфейс для подписанного документа.
 */
export interface ISignedDocument<T = any> {
  hash: string // Хэш документа
  public_key: string // Публичный ключ, использованный для подписи
  signature: string // Цифровая подпись
  meta: IMetaDocument & T // Метаданные документа
}
