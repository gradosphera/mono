import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawVoteCopySettingSelector = {
  id: true,
  source_username: true,
  copier_username: true,
  decision_types: true,
  is_active: true,
  coopname: true,
  copyvote_public_key: true,
  created_at: true,
  updated_at: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['VoteCopySetting']> = rawVoteCopySettingSelector

export type VoteCopySettingModel = ModelTypes['VoteCopySetting']

export const voteCopySettingSelector = Selector('VoteCopySetting')(rawVoteCopySettingSelector)
export { rawVoteCopySettingSelector }
