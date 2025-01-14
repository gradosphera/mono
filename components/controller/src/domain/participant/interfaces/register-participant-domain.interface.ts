import type { Cooperative } from 'cooptypes';

export interface RegisterParticipantDomainInterface {
  username: string;
  privacy_agreement: Cooperative.Document.ISignedDocument<Cooperative.Registry.PrivacyPolicy.Action>;
  signature_agreement: Cooperative.Document.ISignedDocument<Cooperative.Registry.RegulationElectronicSignature.Action>;
  statement: Cooperative.Document.ISignedDocument<Cooperative.Registry.ParticipantApplication.Action>;
  user_agreement: Cooperative.Document.ISignedDocument<Cooperative.Registry.UserAgreement.Action>;
  wallet_agreement: Cooperative.Document.ISignedDocument<Cooperative.Registry.WalletAgreement.Action>;
}
