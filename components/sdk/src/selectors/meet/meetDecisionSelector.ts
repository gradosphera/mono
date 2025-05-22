import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'
import { rawSignedBlockchainDocumentSelector } from '../documents/signedBlockchainDocumentSelector'

// Селектор для MeetQuestionResult
const rawMeetQuestionResultSelector = {
  question_id: true,
  title: true,
  decision: true,
  context: true,
  votes_for: true,
  votes_against: true,
  votes_abstained: true,
  accepted: true,
}

// Проверка валидности MeetQuestionResult
{
  const _validate: MakeAllFieldsRequired<ValueTypes['MeetQuestionResult']> = rawMeetQuestionResultSelector
}

// Селектор для MeetDecision
const rawMeetProcessedSelector = {
  coopname: true,
  hash: true,
  results: rawMeetQuestionResultSelector,
  signed_ballots: true,
  quorum_percent: true,
  quorum_passed: true,
  decision: rawSignedBlockchainDocumentSelector,
  decisionAggregate: rawDocumentAggregateSelector,
}

// Проверка валидности MeetProcessed
{
  const _validate: MakeAllFieldsRequired<ValueTypes['MeetProcessed']> = rawMeetProcessedSelector
}

export type meetQuestionResultModel = ModelTypes['MeetQuestionResult']
export const meetQuestionResultSelector = Selector('MeetQuestionResult')(rawMeetQuestionResultSelector)
export { rawMeetQuestionResultSelector }

export type meetProcessedModel = ModelTypes['MeetProcessed']
export const meetProcessedSelector = Selector('MeetProcessed')(rawMeetProcessedSelector)
export { rawMeetProcessedSelector }
