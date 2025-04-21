import type { Cooperative } from 'cooptypes';
import type { SignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменный интерфейс для подписи решения секретарём
 */
export interface SignBySecretaryOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  secretary_decision: SignedDocumentDomainInterface<Cooperative.Registry.AnnualGeneralMeetingDecision.Meta>;
}
