import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'

// Селектор для Question
const rawQuestionSelector = {
  id: true,
  number: true,
  coopname: true,
  meet_id: true,
  title: true,
  context: true,
  decision: true,
  counter_votes_for: true,
  counter_votes_against: true,
  counter_votes_abstained: true,
  voters_for: true,
  voters_against: true,
  voters_abstained: true,
}

// Селектор для Meet
const rawMeetSelector = {
  id: true,
  hash: true,
  coopname: true,
  type: true,
  initiator: true,
  presider: true,
  secretary: true,
  status: true,
  created_at: true,
  open_at: true,
  close_at: true,
  quorum_percent: true,
  signed_ballots: true,
  current_quorum_percent: true,
  cycle: true,
  quorum_passed: true,
  proposal: rawDocumentAggregateSelector,
  authorization: rawDocumentAggregateSelector,
  decision1: rawDocumentAggregateSelector,
  decision2: rawDocumentAggregateSelector,
}

// Селектор для MeetProcessing
const rawMeetProcessingSelector = {
  hash: true,
  meet: rawMeetSelector,
  questions: rawQuestionSelector,
  isVoted: true,
  extendedStatus: true,
}

// Проверка валидности MeetProcessing
{
  const _validate: MakeAllFieldsRequired<ValueTypes['MeetProcessing']> = rawMeetProcessingSelector
}

export type meetProcessingModel = ModelTypes['MeetProcessing']
export const meetProcessingSelector = Selector('MeetProcessing')(rawMeetProcessingSelector)
export { rawMeetProcessingSelector, rawMeetSelector, rawQuestionSelector }
