import type { Cooperative } from 'cooptypes';

export interface ISignatureInfo {
  id: number;
  signer: string;
  public_key: string;
  signature: string;
  signed_at: string;
}

export interface IObjectedDocument {
  version: string;
  hash: string;
  doc_hash: string;
  meta_hash: string;
  meta: Cooperative.Document.IMetaDocument;
  signatures: ISignatureInfo[];
}

export interface IDocument {
  version: string;
  hash: string;
  doc_hash: string;
  meta_hash: string;
  meta: string;
  signatures: ISignatureInfo[];
}
