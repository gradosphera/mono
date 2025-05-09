import type { Cooperative } from 'cooptypes';
import type { SignedDocumentDomainInterface } from '~/domain/document/interfaces/extended-signed-document-domain.interface';

/**
 * Доменный интерфейс для перезапуска собрания
 */
export interface RestartAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  newproposal: SignedDocumentDomainInterface<Cooperative.Registry.AnnualGeneralMeetingAgenda.Meta>;
  new_open_at: Date;
  new_close_at: Date;
}
