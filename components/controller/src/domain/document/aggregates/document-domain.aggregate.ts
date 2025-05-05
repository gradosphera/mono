import type { DocumentDomainEntity } from '../entity/document-domain.entity';
import type { DocumentAggregateDomainInterface } from '../interfaces/document-domain-aggregate.interface';
import type { ExtendedSignedDocument2DomainInterface } from '../interfaces/signed-document-domain.interface';

export class DocumentDomainAggregate implements DocumentAggregateDomainInterface {
  hash: string;
  document: ExtendedSignedDocument2DomainInterface;
  rawDocument?: DocumentDomainEntity;

  constructor(hash: string, document: ExtendedSignedDocument2DomainInterface, rawDocument?: DocumentDomainEntity) {
    this.rawDocument = rawDocument;
    this.document = document;
    this.hash = hash;
  }
}
