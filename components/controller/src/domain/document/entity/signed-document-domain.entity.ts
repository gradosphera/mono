import type { SignedDocumentDomainInterface } from '../interfaces/signed-document-domain.interface';
import type { DocumentMetaDomainInterface } from '../interfaces/document-meta-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';
import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';

export class SignedDocumentDomainEntity implements SignedDocumentDomainInterface {
  hash: string;
  public_key: string;
  signature: string;
  meta: DocumentMetaDomainInterface;
  is_valid: boolean;
  signer: IndividualDomainInterface | OrganizationDomainInterface | EntrepreneurDomainInterface | null;

  constructor(data: Omit<SignedDocumentDomainEntity, 'is_valid'>) {
    this.public_key = data.public_key;
    this.signature = data.signature;
    this.hash = data.hash;
    this.meta = data.meta;
    this.is_valid = true; //TODO - calc it
    this.signer = data.signer;
  }
}
