import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const onboardingStateFields = {
  blagorost_provision_done: true,
  onboarding_blagorost_provision_hash: true,
  blagorost_offer_done: true,
  onboarding_blagorost_offer_hash: true,
  onboarding_init_at: true,
  onboarding_expire_at: true,
} as const

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalOnboardingState']> = onboardingStateFields

export const capitalOnboardingStateSelector = Selector('CapitalOnboardingState')(onboardingStateFields as any)
