import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type GraphQLTypes, type InputType, Selector, type ValueTypes } from '../../zeus'
import { rawDocumentMetaSelector, rawDocumentSelector } from '../common/documentSelector'

// Определяем объект вручную, чтобы избежать потери типов
const rawSelectBranchDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    braname: true, // Уникальное дополнение
  },
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['SelectBranchDocument']>
  = rawSelectBranchDocumentSelector

// Передаём raw в селектор
export const generateSelectBranchDocumentSelector = Selector('SelectBranchDocument')(rawSelectBranchDocumentSelector)
