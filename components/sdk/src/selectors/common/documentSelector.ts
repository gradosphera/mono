import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

export const rawDocumentSelector = {
  binary: true,
  full_title: true,
  hash: true,
  html: true,
  meta: true, // Общая часть meta
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['GeneratedDocument']>
= rawDocumentSelector

// Передаём raw в селектор
export const documentSelector = Selector('GeneratedDocument')(rawDocumentSelector)
