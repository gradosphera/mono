import * as ParticipantApplication from './100.ParticipantApplication'
import * as DecisionOfParticipantApplication from './501.DecisionOfParticipantApplication'
import * as WalletAgreement from './1.WalletAgreement'

export const Registry = {
  1: WalletAgreement,
  100: ParticipantApplication,
  501: DecisionOfParticipantApplication,
}

export interface IRegistry {
  1: WalletAgreement.Action // Тип данных для документа
  100: ParticipantApplication.Action // Тип данных для документа
  501: DecisionOfParticipantApplication.Action // Тип данных для документа
}

export interface MRegistry {
  1: WalletAgreement.Model // Тип данных для документа
  100: ParticipantApplication.Model // Тип данных для документа
  501: DecisionOfParticipantApplication.Model // Тип данных для документа
}
