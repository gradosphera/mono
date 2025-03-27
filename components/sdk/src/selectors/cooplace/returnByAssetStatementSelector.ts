import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type GraphQLTypes, type InputType, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentMetaSelector, rawDocumentSelector } from '../common/documentSelector'
import { rawCommonRequestSelector } from './commonRequestResponseSelector'

// Определяем объект вручную, чтобы избежать потери типов
const rawReturnByAssetStatementDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    request: rawCommonRequestSelector,
  },
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['ReturnByAssetStatementDocument']>
  = rawReturnByAssetStatementDocumentSelector

// Передаём raw в селектор
export const returnByAssetStatementDocumentSelector = Selector('ReturnByAssetStatementDocument')(rawReturnByAssetStatementDocumentSelector)
