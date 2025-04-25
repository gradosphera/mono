import type { Cooperative } from 'cooptypes';
import type { DocumentAggregateDomainInterface } from './document-domain-aggregate.interface';

export interface StatementDetailAggregateDomainInterface {
  action: Cooperative.Blockchain.IExtendedAction;
  documentAggregate: DocumentAggregateDomainInterface;
}
