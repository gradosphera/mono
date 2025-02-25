import * as WalletAgreement from './1.WalletAgreement'
import * as RegulationElectronicSignaturet from './2.RegulationElectronicSignature'
import * as PrivacyPolicy from './3.PrivacyPolicy'
import * as UserAgreement from './4.UserAgreement'
import * as CoopenomicsAgreement from './50.CoopenomicsAgreement'
import * as ParticipantApplication from './100.ParticipantApplication'
import * as DecisionOfParticipantApplication from './501.DecisionOfParticipantApplication'
import * as SelectBranchStatement from './101.SelectBranchStatement'
import * as ProjectFreeDecision from './599.ProjectFreeDecision'
import * as FreeDecision from './600.FreeDecision'
import * as AssetContributionStatement from './700.assetContributionStatement'
import * as ReturnByAssetStatement from './800.returnByAssetStatement'
import * as AssetContributionDecision from './701.assetContributionDecision'
import * as ReturnByAssetDecision from './801.returnByAssetDecision'

import * as AssetContributionAct from './702.assetContributionAct'
import * as ReturnByAssetAct from './802.returnByAssetAct'
import * as InvestmentAgreement from './1000.InvestmentAgreement'
import * as InvestByResultStatement from './1001.InvestByResultStatement'
import * as InvestByResultAct from './1002.InvestByResultAct'
import * as InvestByMoneyStatement from './1005.InvestByMoneyStatement'
import * as InvestMembershipConvertation from './1010.InvestMembershipConvertation'

export const Registry = {
  1: WalletAgreement,
  2: RegulationElectronicSignaturet,
  3: PrivacyPolicy,
  4: UserAgreement,
  50: CoopenomicsAgreement,
  100: ParticipantApplication,
  101: SelectBranchStatement,
  501: DecisionOfParticipantApplication,
  599: ProjectFreeDecision,
  600: FreeDecision,
  700: AssetContributionStatement,
  701: AssetContributionDecision,
  702: AssetContributionAct,
  800: ReturnByAssetStatement,
  801: ReturnByAssetDecision,
  802: ReturnByAssetAct,
  1000: InvestmentAgreement,
  1001: InvestByResultStatement,
  1002: InvestByResultAct,
  1005: InvestByMoneyStatement,
  1010: InvestMembershipConvertation,
}
