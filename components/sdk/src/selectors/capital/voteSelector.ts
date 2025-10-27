import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { baseCapitalSelector } from './baseCapitalSelector'
const rawVoteSelector = {
  ...baseCapitalSelector,
  id: true,
  coopname: true,
  project_hash: true,
  voter: true,
  recipient: true,
  voter_display_name: true,
  recipient_display_name: true,
  amount: true,
  voted_at: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalVote']> = rawVoteSelector

export type voteModel = ModelTypes['CapitalVote']

export const voteSelector = Selector('CapitalVote')(rawVoteSelector)
export { rawVoteSelector }
