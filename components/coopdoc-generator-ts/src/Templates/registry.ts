import * as ParticipantApplication from './100.ParticipantApplication'
import * as DecisionOfParticipantApplication from './501.DecisionOfParticipantApplication'
import * as WalletAgreement from './1.WalletAgreement'

export const DocumentsRegistry = {
  1: WalletAgreement.Template,
  100: ParticipantApplication.Template,
  501: DecisionOfParticipantApplication.Template,
}

export interface DocumentsMappingByActionAndCode {
  'registrator::joincoop': ParticipantApplication.Interface // Тип данных для документа 'registrator::joincoop'
  'registrator::joincoopdec': DecisionOfParticipantApplication.Interface // Тип данных для документа 'registrator::joincoopdec'
  'soviet::sndagreement': WalletAgreement.Interface
}
