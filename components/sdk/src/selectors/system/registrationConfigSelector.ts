import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { registrationProgramSelector } from './registrationProgramSelector'

export const rawRegistrationConfigSelector = {
  requires_selection: true,
  programs: registrationProgramSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['RegistrationConfig']> = rawRegistrationConfigSelector

export const registrationConfigSelector = Selector('RegistrationConfig')(rawRegistrationConfigSelector)
