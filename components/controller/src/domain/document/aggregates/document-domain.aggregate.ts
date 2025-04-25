import type { DocumentDomainEntity } from '../entity/document-domain.entity';
import type { SignedDocumentDomainEntity } from '../entity/signed-document-domain.entity';
import type { DocumentAggregateDomainInterface } from '../interfaces/document-domain-aggregate.interface';

export class DocumentDomainAggregate implements DocumentAggregateDomainInterface {
  hash: string;
  signatures: SignedDocumentDomainEntity[];
  rawDocument?: DocumentDomainEntity;

  constructor(hash: string, rawDocument?: DocumentDomainEntity, signatures: SignedDocumentDomainEntity[] = []) {
    this.rawDocument = rawDocument;
    this.signatures = signatures;
    this.hash = hash;
  }

  addSignature(signature: SignedDocumentDomainEntity): void {
    this.signatures.push(signature);
  }
}
