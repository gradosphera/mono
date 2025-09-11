import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawVoteSelector = {
  _id: true,
  id: true,
  block_num: true,
  present: true,
  project_hash: true,
  voter: true,
  recipient: true,
  amount: true,
  voted_at: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalVote']> = rawVoteSelector

export type voteModel = ModelTypes['CapitalVote']

export const voteSelector = Selector('CapitalVote')(rawVoteSelector)
export { rawVoteSelector }
