import { Selector } from '../../zeus'

const onboardingStateFields = {
  wallet_agreement_done: true,
  onboarding_wallet_agreement_hash: true,
  signature_agreement_done: true,
  onboarding_signature_agreement_hash: true,
  privacy_agreement_done: true,
  onboarding_privacy_agreement_hash: true,
  user_agreement_done: true,
  onboarding_user_agreement_hash: true,
  participant_application_done: true,
  onboarding_participant_application_hash: true,
  voskhod_membership_done: true,
  onboarding_voskhod_membership_hash: true,
  general_meet_done: true,
  onboarding_general_meet_hash: true,
  onboarding_init_at: true,
  onboarding_expire_at: true,
} as const

export const chairmanOnboardingStateSelector = Selector('ChairmanOnboardingState')(onboardingStateFields as any)
