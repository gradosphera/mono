import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';
import type { VotingAgendaDomainInterface } from './voting-agenda-domain.interface';

export interface AgendaWithDocumentsDomainInterface extends VotingAgendaDomainInterface {
  documents: DocumentPackageAggregateDomainInterface;
}
