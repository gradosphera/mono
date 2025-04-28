import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';
import type { DocumentMetaDomainInterface } from './document-meta-domain.interface';

export interface ExtendedSignedDocumentDomainInterface {
  hash: string;
  public_key: string;
  signature: string;
  meta: DocumentMetaDomainInterface;
  is_valid: boolean;
  signer: IndividualDomainInterface | OrganizationDomainInterface | EntrepreneurDomainInterface | null;
  //TODO: signed_at
}
