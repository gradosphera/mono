import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawUserCertificateUnionSelector } from '../common/userCertificateUnionSelector'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'

// Селектор для AgendaMeetPoint
const rawAgendaMeetPointSelector = {
  context: true,
  title: true,
  decision: true,
}

// Селектор для MeetPreProcessing
const rawMeetPreProcessingSelector = {
  hash: true,
  coopname: true,
  initiator: true,
  initiator_certificate: rawUserCertificateUnionSelector,
  presider: true,
  secretary: true,
  presider_certificate: rawUserCertificateUnionSelector,
  secretary_certificate: rawUserCertificateUnionSelector,
  agenda: rawAgendaMeetPointSelector,
  open_at: true,
  close_at: true,
  proposal: rawDocumentAggregateSelector,
}

// Проверка валидности MeetPreProcessing
const _validate: MakeAllFieldsRequired<ValueTypes['MeetPreProcessing']> = rawMeetPreProcessingSelector

export type meetPreProcessingModel = ModelTypes['MeetPreProcessing']
export const meetPreProcessingSelector = Selector('MeetPreProcessing')(rawMeetPreProcessingSelector)
export { rawAgendaMeetPointSelector, rawMeetPreProcessingSelector }
