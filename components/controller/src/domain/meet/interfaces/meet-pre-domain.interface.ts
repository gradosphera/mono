// domain/interfaces/meet-lifecycle-domain.interface.ts

import type { MeetContract } from 'cooptypes';
import { assertType, type AssertKeysMatch } from '~/shared/asserts/blockchain-type.assert';
import type { AgendaGeneralMeetPointInputDomainInterface } from './agenda-meet-point-input-domain.interface';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import type { UserCertificateDomainInterface } from '~/domain/user/interfaces/user-certificate-domain.interface';

// === PreProcessing ===

export interface MeetPreProcessingDomainInterface {
  coopname: string;
  hash: string;
  initiator: string;
  initiator_certificate?: UserCertificateDomainInterface | null;
  presider: string;
  secretary: string;
  presider_certificate?: UserCertificateDomainInterface | null;
  secretary_certificate?: UserCertificateDomainInterface | null;
  agenda: AgendaGeneralMeetPointInputDomainInterface[];
  open_at: Date;
  close_at: Date;
  proposal?: DocumentAggregateDomainInterface;
}

assertType<AssertKeysMatch<MeetContract.Actions.CreateMeet.IInput, MeetPreProcessingDomainInterface>>();
