import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export interface RegisterParticipantDomainInterface {
  username: string;
  braname?: string;
  privacy_agreement: ISignedDocumentDomainInterface;
  signature_agreement: ISignedDocumentDomainInterface;
  statement: ISignedDocumentDomainInterface;
  user_agreement: ISignedDocumentDomainInterface;
  wallet_agreement: ISignedDocumentDomainInterface;
}
