import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменный интерфейс для подписи решения председателем
 */
export interface SignByPresiderOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  username: string;
  presider_decision: ISignedDocumentDomainInterface;
}
