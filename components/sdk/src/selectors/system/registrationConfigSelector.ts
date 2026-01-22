import { Selector } from '../../zeus/index'

export const registrationProgramSelector = Selector('RegistrationProgram')({
  key: true,
  title: true,
  description: true,
  image_url: true,
  requirements: true,
  applicable_account_types: true,
  order: true,
})

export const registrationConfigSelector = Selector('RegistrationConfig')({
  requires_selection: true,
  programs: registrationProgramSelector,
})
