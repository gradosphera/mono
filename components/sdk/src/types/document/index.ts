import type { Cooperative } from 'cooptypes'
import type { ModelTypes } from '../../zeus/index'

/**
 * Интерфейс для метаданных документа.
 */
export type IMetaDocument = Cooperative.Document.IMetaDocument

/**
 * Интерфейс для сгенерированного документа, который требуется подписать.
 */
export type IGeneratedDocument<T = any> = Cooperative.Document.ZGeneratedDocument<T>

/**
 * Интерфейс для информации о подписи в документе.
 */
export type ISignatureInfo = Cooperative.Document.ISignatureInfo

/**
 * Интерфейс для подписанного документа.
 */
export type ISignedDocument<T = any> = Cooperative.Document.ISignedDocument2<T>
