import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

// Определяем объект вручную, чтобы избежать потери типов
const rawFreeProjectSelector = {
  decision: true,
  id: true,
  title: true,
  question: true,
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['CreatedProjectFreeDecision']>
= rawFreeProjectSelector

// Передаём raw в селектор
export const createdProjectFreeDecisionSelector = Selector('CreatedProjectFreeDecision')(rawFreeProjectSelector)
