import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type GraphQLTypes, type InputType, Selector, type ValueTypes } from '../../zeus'
import { rawDocumentMetaSelector, rawDocumentSelector } from '../common/documentSelector'

// Определяем объект вручную, чтобы избежать потери типов
const rawReturnByAssetActDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    request_id: true,
    act_id: true,
    braname: true,
    decision_id: true,
    transmitter: true,
  },
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['ReturnByAssetActDocument']>
  = rawReturnByAssetActDocumentSelector

// Передаём raw в селектор
export const returnByAssetActDocumentSelector = Selector('ReturnByAssetActDocument')(rawReturnByAssetActDocumentSelector)
