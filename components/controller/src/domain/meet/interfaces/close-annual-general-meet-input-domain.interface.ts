import type { Cooperative } from 'cooptypes';

/**
 * Доменный интерфейс для закрытия собрания
 */
export interface CloseAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  meet_decision: Cooperative.Document.ISignedDocument;
}
