import type { ExtendedBlockchainActionDomainInterface } from '~/domain/agenda/interfaces/extended-blockchain-action-domain.interface';
import type { DocumentAggregateDomainInterface } from './document-domain-aggregate.interface';

export interface ActDetailAggregateDomainInterface {
  action: ExtendedBlockchainActionDomainInterface;
  documentAggregate: DocumentAggregateDomainInterface;
}
