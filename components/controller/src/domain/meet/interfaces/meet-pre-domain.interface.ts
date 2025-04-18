// domain/interfaces/meet-lifecycle-domain.interface.ts

import type { Cooperative, MeetContract } from 'cooptypes';
import { assertType, type AssertKeysMatch } from '~/shared/asserts/blockchain-type.assert';
import type { AgendaMeetPointInputDomainInterface } from './agenda-meet-point-input-domain.interface';

// === PreProcessing ===

export interface MeetPreProcessingDomainInterface {
  coopname: string;
  type: string;
  hash: string;
  initiator: string;
  presider: string;
  secretary: string;
  agenda: AgendaMeetPointInputDomainInterface[];
  open_at: Date;
  close_at: Date;
  created_at: Date;
  proposal?: Cooperative.Document.ISignedDocument<Cooperative.Registry.AnnualGeneralMeetingAgenda.Action>;
}

assertType<AssertKeysMatch<MeetContract.Actions.CreateMeet.IInput, MeetPreProcessingDomainInterface>>();
