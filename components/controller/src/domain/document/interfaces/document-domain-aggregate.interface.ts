import type { GeneratedDocumentDomainInterface } from './generated-document-domain.interface';
import type { ExtendedSignedDocumentDomainInterface } from './extended-signed-document-domain.interface';

export interface DocumentAggregateDomainInterface {
  hash: string;
  document: ExtendedSignedDocumentDomainInterface;
  rawDocument?: GeneratedDocumentDomainInterface;
}
