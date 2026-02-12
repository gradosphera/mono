import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawChatCoopAccountStatusSelector = {
  hasAccount: true,
  matrixUsername: true,
  iframeUrl: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['MatrixAccountStatusResponseDTO']> = rawChatCoopAccountStatusSelector

export type chatcoopAccountStatusModel = ModelTypes['MatrixAccountStatusResponseDTO']

export const chatcoopAccountStatusSelector = Selector('MatrixAccountStatusResponseDTO')(rawChatCoopAccountStatusSelector)
export { rawChatCoopAccountStatusSelector }

// Экспорт селекторов для транскрипций
export * from './transcription'
