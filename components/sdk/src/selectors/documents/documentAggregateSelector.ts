import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { rawUserUnionSelector } from '../common/userUnionSelector'

// Селектор для сырого документа
export const rawRawDocumentSelector = {
  hash: true,
  binary: true,
  full_title: true,
  html: true,
  meta: true,
}

// Селектор для информации о подписи в документе версии 2
export const rawSignatureInfoSelector = {
  id: true,
  signer: true,
  public_key: true,
  signature: true,
  signed_at: true,
  is_valid: true,
  signer_info: rawUserUnionSelector,
}

// Селектор для документа версии 2
export const rawDocumentSignatureSelector = {
  version: true,
  hash: true,
  doc_hash: true,
  meta_hash: true,
  meta: true,
  signatures: rawSignatureInfoSelector,
}

// Селектор для агрегата документа версии 2
export const rawDocumentAggregateSelector = {
  hash: true,
  document: rawDocumentSignatureSelector,
  rawDocument: rawRawDocumentSelector,
}

// Проверка валидности селектора документа на первом попавшемся типе т.к. абстрактные типы zeus в документацию не затягивает
const _validate: MakeAllFieldsRequired<ValueTypes['DocumentAggregate']> = rawDocumentAggregateSelector

/**
 * Базовый селектор для всех агрегатов документов версии 2
 * Соответствует новой структуре DocumentAggregateBaseDTO в бэкенде
 */
export const documentAggregateSelector = rawDocumentAggregateSelector
