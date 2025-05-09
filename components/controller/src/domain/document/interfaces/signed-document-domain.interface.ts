import type { IMetaDocumentDomainInterface } from './meta-document-domain.interface';
import type { ISignatureInfoDomainInterface } from './signature-info-domain.interface';

export type ISignedDocumentDomainInterface = {
  version: string;
  hash: string;
  doc_hash: string;
  meta_hash: string;
  meta: IMetaDocumentDomainInterface & { [key: string]: any };
  signatures: ISignatureInfoDomainInterface[];
};
