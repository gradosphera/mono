import { Selector } from '../../zeus'

const extensionOnboardingStepStateFields = {
  step_key: true,
  done: true,
  hash: true,
  order: true,
  default_title: true,
} as const

const extensionOnboardingStateFields = {
  extension_name: true,
  steps: extensionOnboardingStepStateFields,
  onboarding_init_at: true,
  onboarding_expire_at: true,
  all_done: true,
} as const

export const extensionOnboardingStateSelector = Selector('ExtensionOnboardingState')(
  extensionOnboardingStateFields as any
)
