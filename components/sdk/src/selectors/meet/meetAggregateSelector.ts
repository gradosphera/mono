import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawMeetProcessedSelector } from './meetDecisionSelector'
import { rawMeetPreProcessingSelector } from './meetPreSelector'
import { rawMeetProcessingSelector } from './meetProcessingSelector'

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
