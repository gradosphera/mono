import type { GeneratedDocumentDomainInterface } from './generated-document-domain.interface';
import type { SignedDocumentDomainInterface } from './signed-document-domain.interface';

export interface DocumentAggregateDomainInterface {
  hash: string;
  signatures: SignedDocumentDomainInterface[];
  rawDocument?: GeneratedDocumentDomainInterface;
}
