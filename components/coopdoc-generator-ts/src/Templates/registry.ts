import * as ParticipantApplication from './100.ParticipantApplication'
import * as DecisionOfParticipantApplication from './501.DecisionOfParticipantApplication'

export const DocumentsRegistry = {
  100: ParticipantApplication.ParticipantApplicationTemplate,
  501: DecisionOfParticipantApplication.DecisionOfParticipantApplicationTemplate,
}
export interface DocumentsMappingByActionAndCode {
  'registrator::joincoop': ParticipantApplication.IJoinCoopAction // Тип данных для документа 'registrator::joincoop'
  'registrator::joincoopdec': DecisionOfParticipantApplication.IJoinCoopDecisionAction // Тип данных для документа 'registrator::joincoopdec'
}
