import type { Cooperative } from 'cooptypes';

/**
 * Доменный интерфейс для подписи решения секретарём
 */
export interface SignBySecretaryOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  username: string;
  secretary_decision: Cooperative.Document.ISignedDocument;
}
