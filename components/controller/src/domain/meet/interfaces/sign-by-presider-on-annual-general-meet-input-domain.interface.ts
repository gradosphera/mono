import type { Cooperative } from 'cooptypes';
import type { SignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменный интерфейс для подписи решения председателем
 */
export interface SignByPresiderOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  presider_decision: SignedDocumentDomainInterface<Cooperative.Registry.AnnualGeneralMeetingDecision.Meta>;
}
