import * as WalletAgreement from './1.WalletAgreement'
import * as RegulationElectronicSignaturet from './2.RegulationElectronicSignature'
import * as PrivacyPolicy from './3.PrivacyPolicy'
import * as UserAgreement from './4.UserAgreement'
import * as CoopenomicsAgreement from './50.CoopenomicsAgreement'
import * as ParticipantApplication from './100.ParticipantApplication'
import * as DecisionOfParticipantApplication from './501.DecisionOfParticipantApplication'
import * as SelectBranchStatement from './101.SelectBranchStatement'

export const Registry = {
  1: WalletAgreement,
  2: RegulationElectronicSignaturet,
  3: PrivacyPolicy,
  4: UserAgreement,
  50: CoopenomicsAgreement,
  100: ParticipantApplication,
  101: SelectBranchStatement,
  501: DecisionOfParticipantApplication,
}
