import type { Cooperative } from 'cooptypes';

/**
 * Доменный интерфейс для подписи решения председателем
 */
export interface SignByPresiderOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  username: string;
  presider_decision: Cooperative.Document.ISignedDocument;
}
