import type { ExtendedBlockchainActionDomainInterface } from '~/domain/agenda/interfaces/extended-blockchain-action-domain.interface';
import type { DocumentAggregateDomainInterface } from './document-domain-aggregate.interface';

export interface DecisionDetailAggregateDomainInterface {
  action: ExtendedBlockchainActionDomainInterface;
  documentAggregate: DocumentAggregateDomainInterface;
  votes_for: ExtendedBlockchainActionDomainInterface[];
  votes_against: ExtendedBlockchainActionDomainInterface[];
}
