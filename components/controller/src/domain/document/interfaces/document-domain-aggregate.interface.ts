import type { DocumentMetaDomainInterface } from './document-meta-domain.interface';
import type { GeneratedDocumentDomainInterface } from './generated-document-domain.interface';
import type { SignedDocumentDomainInterface } from './signed-document-domain.interface';

export interface DocumentAggregateDomainInterface<T extends DocumentMetaDomainInterface> {
  hash: string;
  signatures: SignedDocumentDomainInterface<T>[];
  rawDocument?: GeneratedDocumentDomainInterface;
}
