import * as ParticipantApplication from './100.ParticipantApplication'
import * as DecisionOfParticipantApplication from './501.DecisionOfParticipantApplication'
import * as ProgramProvision from './1000.ProgramProvision'

export const DocumentsRegistry = {
  100: ParticipantApplication.ParticipantApplicationTemplate,
  501: DecisionOfParticipantApplication.DecisionOfParticipantApplicationTemplate,
  1000: ProgramProvision.JoinProgramTemplate,
}

export interface DocumentsMappingByActionAndCode {
  'registrator::joincoop': ParticipantApplication.IJoinCoopAction // Тип данных для документа 'registrator::joincoop'
  'registrator::joincoopdec': DecisionOfParticipantApplication.IJoinCoopDecisionAction // Тип данных для документа 'registrator::joincoopdec'
  'soviet::joinprog': ProgramProvision.IJoinProgram
}
