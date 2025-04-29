import type { DocumentAggregateDomainInterface } from './document-domain-aggregate.interface';
import type { ActDetailAggregateDomainInterface } from './act-detail-aggregate-domain.interface';
import type { DecisionDetailAggregateDomainInterface } from './decision-detail-aggregate-domain.interface';
import type { StatementDetailAggregateDomainInterface } from './statement-detail-aggregate-domain.interface';

export interface DocumentPackageAggregateDomainInterface {
  statement: StatementDetailAggregateDomainInterface | null;
  decision: DecisionDetailAggregateDomainInterface | null;
  acts: ActDetailAggregateDomainInterface[];
  links: DocumentAggregateDomainInterface[];
}
