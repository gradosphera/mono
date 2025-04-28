import type { GeneratedDocumentDomainInterface } from './generated-document-domain.interface';
import type { ExtendedSignedDocumentDomainInterface } from './signed-document-domain.interface';

export interface DocumentAggregateDomainInterface {
  hash: string;
  signatures: ExtendedSignedDocumentDomainInterface[];
  rawDocument?: GeneratedDocumentDomainInterface;
}
