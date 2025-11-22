import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawExtensionLogSelector = {
  id: true,
  extension_local_id: true,
  name: true,
  data: true,
  created_at: true,
  updated_at: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['ExtensionLog']> = rawExtensionLogSelector
export type extensionLogModel = ModelTypes['ExtensionLog']

export const extensionLogSelector = Selector('ExtensionLog')(rawExtensionLogSelector)
export { rawExtensionLogSelector }
