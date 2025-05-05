import type { GeneratedDocumentDomainInterface } from './generated-document-domain.interface';
import type { ExtendedSignedDocument2DomainInterface } from './signed-document-domain.interface';

export interface DocumentAggregateDomainInterface {
  hash: string;
  document: ExtendedSignedDocument2DomainInterface;
  rawDocument?: GeneratedDocumentDomainInterface;
}
