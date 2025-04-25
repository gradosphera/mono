import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { rawUserUnionSelector } from '../common/userUnionSelector'

// Селектор для подписи документа
export const rawDocumentSignatureSelector = {
  hash: true,
  public_key: true,
  signature: true,
  meta: true,
  is_valid: true,
  signer: rawUserUnionSelector,
}

// Селектор для сырого документа
export const rawRawDocumentSelector = {
  hash: true,
  binary: true,
  full_title: true,
  html: true,
  meta: true,
}

// Селектор для агрегата документа
export const rawDocumentAggregateSelector = {
  hash: true,
  signatures: rawDocumentSignatureSelector,
  rawDocument: rawRawDocumentSelector,
}

/**
 * Базовый селектор для всех агрегатов документов
 * Соответствует структуре DocumentAggregateBaseDTO в бэкенде
 * Важно: не используем массив для signatures - Zeus сам применит
 * селектор к каждому элементу массива
 */
export const documentAggregateSelector = rawDocumentAggregateSelector

// Проверка валидности селектора документа на первом попавшемся типе т.к. абстрактные типы zeus в документацию не затягивает
const _validate: MakeAllFieldsRequired<ValueTypes['DocumentAggregate']> = rawDocumentAggregateSelector
