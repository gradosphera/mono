import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

export const rawRegistrationProgramSelector = {
  key: true,
  title: true,
  description: true,
  image_url: true,
  requirements: true,
  applicable_account_types: true,
  order: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['RegistrationProgram']> = rawRegistrationProgramSelector

export const registrationProgramSelector = Selector('RegistrationProgram')(rawRegistrationProgramSelector)
