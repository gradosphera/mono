import type { ExtendedBlockchainActionDomainInterface } from '~/domain/agenda/interfaces/extended-blockchain-action-domain.interface';
import type { DocumentAggregateDomainInterface } from './document-domain-aggregate.interface';

export interface StatementDetailAggregateDomainInterface {
  action: ExtendedBlockchainActionDomainInterface;
  documentAggregate: DocumentAggregateDomainInterface;
}
