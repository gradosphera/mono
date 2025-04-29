import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawWorkspaceSelector = {
  name: true,
  title: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['DesktopWorkspace']> = rawWorkspaceSelector
export type workspaceModel = ModelTypes['DesktopWorkspace']

export const workspaceSelector = Selector('DesktopWorkspace')(rawWorkspaceSelector)
export { rawWorkspaceSelector }
