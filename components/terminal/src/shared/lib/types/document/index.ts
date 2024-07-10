export interface IObjectedDocument {
  hash: string;
  meta: object;
  public_key: string;
  signature: string;
}

export interface IDocument {
  hash: string;
  meta: string;
  public_key: string;
  signature: string;
}
