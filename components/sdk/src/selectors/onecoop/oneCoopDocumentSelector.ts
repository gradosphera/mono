import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

export const rawOneCoopDocumentSelector = {
  action: true,
  block_num: true,
  package: true,
  hash: true,
  data: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['OneCoopDocumentOutput']> = rawOneCoopDocumentSelector

export const oneCoopDocumentSelector = Selector('OneCoopDocumentOutput')(rawOneCoopDocumentSelector)
