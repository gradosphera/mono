import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export interface ConvertToAxonInputDomainInterface {
  coopname: string;
  username: string;
  document: ISignedDocumentDomainInterface;
  convert_amount: string;
}
