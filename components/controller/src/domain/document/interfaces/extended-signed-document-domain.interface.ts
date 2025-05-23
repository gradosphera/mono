import type { ISignedDocumentDomainInterface } from './signed-document-domain.interface';
import type { ISignatureInfoDomainInterface } from './signature-info-domain.interface';
import type { UserCertificateDomainInterface } from '~/domain/user-certificate/interfaces/user-certificate-domain.interface';

export interface SignatureInfoDomainInterface extends ISignatureInfoDomainInterface {
  is_valid?: boolean;
  signer_certificate?: UserCertificateDomainInterface | null;
}

export interface ExtendedSignedDocumentDomainInterface extends ISignedDocumentDomainInterface {
  signatures: SignatureInfoDomainInterface[];
}
