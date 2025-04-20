import type { DocumentDomainEntity } from '../entity/document-domain.entity';
import type { SignedDocumentDomainEntity } from '../entity/signed-document-domain.entity';
import type { DocumentAggregateDomainInterface } from '../interfaces/document-domain-aggregate.interface';
import type { DocumentMetaDomainInterface } from '../interfaces/document-meta-domain.interface';

export class DocumentDomainAggregate<T extends DocumentMetaDomainInterface> implements DocumentAggregateDomainInterface<T> {
  hash: string;
  signatures: SignedDocumentDomainEntity<T>[];
  rawDocument?: DocumentDomainEntity;

  constructor(hash: string, rawDocument?: DocumentDomainEntity, signatures: SignedDocumentDomainEntity<T>[] = []) {
    this.rawDocument = rawDocument;
    this.signatures = signatures;
    this.hash = hash;
  }

  addSignature(signature: SignedDocumentDomainEntity<T>): void {
    this.signatures.push(signature);
  }
}
