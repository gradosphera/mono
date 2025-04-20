import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawBlockchainActionSelector } from '../common/blockchainActionSelector'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'

// Селектор для AgendaMeetPoint
const rawAgendaMeetPointSelector = {
  context: true,
  title: true,
  decision: true,
}

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
}

// Селектор для MeetProcessing
const rawMeetProcessingSelector = {
  hash: true,
  meet: rawMeetSelector,
  questions: rawQuestionSelector,
}

// Проверка валидности MeetProcessing
{
  const _validate: MakeAllFieldsRequired<ValueTypes['MeetProcessing']> = rawMeetProcessingSelector
}

// Селектор для MeetPreProcessing
const rawMeetPreProcessingSelector = {
  hash: true,
  coopname: true,
  initiator: true,
  presider: true,
  secretary: true,
  agenda: rawAgendaMeetPointSelector,
  open_at: true,
  close_at: true,
  proposal: rawDocumentAggregateSelector,
}

// Проверка валидности MeetPreProcessing
{
  const _validate: MakeAllFieldsRequired<ValueTypes['MeetPreProcessing']> = rawMeetPreProcessingSelector
}

// Селектор для MeetProcessed
const rawMeetProcessedSelector = {
  hash: true,
  decision: rawBlockchainActionSelector,
}

// Проверка валидности MeetProcessed
{
  const _validate: MakeAllFieldsRequired<ValueTypes['MeetProcessed']> = rawMeetProcessedSelector
}

// Базовый селектор для MeetAggregate
const rawMeetAggregateSelector = {
  hash: true,
  pre: rawMeetPreProcessingSelector,
  processing: rawMeetProcessingSelector,
  processed: rawMeetProcessedSelector,
}

// Проверка валидности MeetAggregate
{
  const _validate: MakeAllFieldsRequired<ValueTypes['MeetAggregate']> = rawMeetAggregateSelector
}

export type meetAggregateModel = ModelTypes['MeetAggregate']
export const meetAggregateSelector = Selector('MeetAggregate')(rawMeetAggregateSelector)
export { rawMeetAggregateSelector }
