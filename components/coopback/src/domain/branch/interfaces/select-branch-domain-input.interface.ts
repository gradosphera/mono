import type { Cooperative } from 'cooptypes';

export interface SelectBranchInputDomainInterface {
  coopname: string;
  braname: string;
  username: string;
  document: Cooperative.Document.ISignedDocument;
}
