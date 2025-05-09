import type { Cooperative } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export interface RegisterParticipantDomainInterface {
  username: string;
  braname?: string;
  privacy_agreement: ISignedDocumentDomainInterface<Cooperative.Registry.PrivacyPolicy.Action>;
  signature_agreement: ISignedDocumentDomainInterface<Cooperative.Registry.RegulationElectronicSignature.Action>;
  statement: ISignedDocumentDomainInterface<Cooperative.Registry.ParticipantApplication.Action>;
  user_agreement: ISignedDocumentDomainInterface<Cooperative.Registry.UserAgreement.Action>;
  wallet_agreement: ISignedDocumentDomainInterface<Cooperative.Registry.WalletAgreement.Action>;
}
