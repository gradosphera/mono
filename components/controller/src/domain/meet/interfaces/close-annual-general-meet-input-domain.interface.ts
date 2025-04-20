import type { Cooperative } from 'cooptypes';
import type { SignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменный интерфейс для закрытия собрания
 */
export interface CloseAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  meet_decision: SignedDocumentDomainInterface<Cooperative.Registry.AnnualGeneralMeetingDecision.Meta>;
}
