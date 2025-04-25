import type { Cooperative } from 'cooptypes';
import type { DocumentAggregateDomainInterface } from './document-domain-aggregate.interface';

export interface DecisionDetailAggregateDomainInterface {
  action: Cooperative.Blockchain.IExtendedAction;
  documentAggregate: DocumentAggregateDomainInterface;
  votes_for: Cooperative.Blockchain.IExtendedAction[];
  votes_against: Cooperative.Blockchain.IExtendedAction[];
}
