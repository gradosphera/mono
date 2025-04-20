import type { SignedDocumentDomainInterface } from '../interfaces/signed-document-domain.interface';
import type { DocumentMetaDomainInterface } from '../interfaces/document-meta-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';
import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';

export class SignedDocumentDomainEntity<T extends DocumentMetaDomainInterface> implements SignedDocumentDomainInterface<T> {
  hash: string;
  public_key: string;
  signature: string;
  meta: T;
  is_valid: boolean;
  signer: IndividualDomainInterface | OrganizationDomainInterface | EntrepreneurDomainInterface;

  constructor(
    data: SignedDocumentDomainEntity<T>,
    signer: IndividualDomainInterface | OrganizationDomainInterface | EntrepreneurDomainInterface
  ) {
    this.public_key = data.public_key;
    this.signature = data.signature;
    this.hash = data.hash;
    this.meta = data.meta;
    this.is_valid = true; //TODO - calc it
    this.signer = signer;
  }
}
