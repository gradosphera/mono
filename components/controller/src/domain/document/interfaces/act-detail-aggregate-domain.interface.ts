import type { Cooperative } from 'cooptypes';
import type { DocumentAggregateDomainInterface } from './document-domain-aggregate.interface';

export interface ActDetailAggregateDomainInterface {
  action: Cooperative.Blockchain.IExtendedAction;
  documentAggregate: DocumentAggregateDomainInterface;
}
