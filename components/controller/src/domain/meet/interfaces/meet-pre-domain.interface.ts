// domain/interfaces/meet-lifecycle-domain.interface.ts

import type { Cooperative, MeetContract } from 'cooptypes';
import { assertType, type AssertKeysMatch } from '~/shared/asserts/blockchain-type.assert';
import type { AgendaMeetPointInputDomainInterface } from './agenda-meet-point-input-domain.interface';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';

// === PreProcessing ===

export interface MeetPreProcessingDomainInterface {
  coopname: string;
  hash: string;
  initiator: string;
  presider: string;
  secretary: string;
  agenda: AgendaMeetPointInputDomainInterface[];
  open_at: Date;
  close_at: Date;
  proposal?: DocumentAggregateDomainInterface<
    Cooperative.Registry.AnnualGeneralMeetingAgenda.Action & Cooperative.Document.IMetaDocument
  >;
}

assertType<AssertKeysMatch<MeetContract.Actions.CreateMeet.IInput, MeetPreProcessingDomainInterface>>();
