import type { MeetPreProcessingDomainInterface } from './meet-pre-domain.interface';
import type { MeetProcessedDomainInterface } from './meet-processed-domain.interface';
import type { MeetProcessingDomainInterface } from './meet-processing-domain.interface';

// === Aggregated Lifecycle ===

export interface MeetDomainAggregate {
  hash: string;
  pre?: MeetPreProcessingDomainInterface | null;
  processing?: MeetProcessingDomainInterface | null;
  processed?: MeetProcessedDomainInterface | null;
}
