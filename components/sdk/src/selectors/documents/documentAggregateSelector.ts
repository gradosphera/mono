import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

// Селектор для метаданных документа
export const rawDocumentMetaSelector = {
  block_num: true,
  coopname: true,
  created_at: true,
  generator: true,
  lang: true,
  links: true,
  registry_id: true,
  timezone: true,
  title: true,
  username: true,
  version: true,
}

// Селектор для подписи документа
export const rawDocumentSignatureSelector = {
  hash: true,
  public_key: true,
  signature: true,
  meta: rawDocumentMetaSelector,
}

// Селектор для сырого документа
export const rawRawDocumentSelector = {
  hash: true,
  binary: true,
  full_title: true,
  html: true,
  meta: rawDocumentMetaSelector,
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
export const rawDocumentAggregateBaseSelector = rawDocumentAggregateSelector

// Проверка валидности селектора документа на первом попавшемся типе т.к. абстрактные типы zeus в документацию не затягивает
const _validate: MakeAllFieldsRequired<ValueTypes['AnnualGeneralMeetingAgendaDocumentAggregate']> = rawDocumentAggregateSelector
