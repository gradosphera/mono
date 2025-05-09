import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';
import type { ISignedDocumentDomainInterface } from './signed-document-domain.interface';
import type { ISignatureInfoDomainInterface } from './signature-info-domain.interface';

export interface SignatureInfoDomainInterface extends ISignatureInfoDomainInterface {
  is_valid?: boolean;
  signer_info?: IndividualDomainInterface | OrganizationDomainInterface | EntrepreneurDomainInterface | null;
}

export interface ExtendedSignedDocumentDomainInterface extends ISignedDocumentDomainInterface {
  signatures: SignatureInfoDomainInterface[];
}
