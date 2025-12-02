import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawWorkspaceSelector } from './workspaceSelector'

const rawDesktopSelector = {
  coopname: true,
  layout: true,
  workspaces: rawWorkspaceSelector,
  authorizedHome: true,
  nonAuthorizedHome: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['Desktop']> = rawDesktopSelector
export type desktopModel = ModelTypes['Desktop']

export const desktopSelector = Selector('Desktop')(rawDesktopSelector)
export { rawDesktopSelector }
