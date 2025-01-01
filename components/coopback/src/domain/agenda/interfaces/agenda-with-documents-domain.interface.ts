import type { DocumentPackageDomainInterface } from './document-package-domain.interface';
import type { VotingAgendaDomainInterface } from './voting-agenda-domain.interface';

export interface AgendaWithDocumentsDomainInterface extends VotingAgendaDomainInterface {
  documents: DocumentPackageDomainInterface;
}
