import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
/**
 * Доменный интерфейс для подписи решения секретарём
 */
export interface SignBySecretaryOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  username: string;
  secretary_decision: ISignedDocumentDomainInterface;
}
