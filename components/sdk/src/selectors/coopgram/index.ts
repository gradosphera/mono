import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawCoopgramAccountStatusSelector = {
  hasAccount: true,
  matrixUsername: true,
  iframeUrl: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['MatrixAccountStatusResponseDTO']> = rawCoopgramAccountStatusSelector

export type coopgramAccountStatusModel = ModelTypes['MatrixAccountStatusResponseDTO']

export const coopgramAccountStatusSelector = Selector('MatrixAccountStatusResponseDTO')(rawCoopgramAccountStatusSelector)
export { rawCoopgramAccountStatusSelector }
