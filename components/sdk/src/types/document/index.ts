import type { Cooperative } from 'cooptypes'
import type { Zeus } from '../..'
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
export type ISignatureInfoInput = Zeus.ModelTypes['SignatureInfoInput']
export type ISignatureInfo = Zeus.ModelTypes['SignatureInfo']

/**
 * Интерфейс для подписанного документа.
 */
export type ISignedDocument = Zeus.ModelTypes['SignedDigitalDocument']
export type ISignedDocumentInput = Zeus.ModelTypes['SignedDigitalDocumentInput']
/**
 * Интерфейс для подписанного документа.
 */
export type ISignedChainDocument = Cooperative.Document.IChainDocument2
