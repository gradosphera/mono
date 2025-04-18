import type { Cooperative, MeetContract } from 'cooptypes';
import { assertType, type AssertKeysMatch } from '~/shared/asserts/blockchain-type.assert';

export interface MeetRowProcessingDomainInterface {
  id: number;
  hash: string;
  coopname: string;
  type: string;
  initiator: string;
  presider: string;
  secretary: string;
  status: string;
  created_at: Date;
  open_at: Date;
  close_at: Date;
  quorum_percent: number;
  signed_ballots: number;
  current_quorum_percent: number;
  cycle: number;
  quorum_passed: boolean;
  proposal: Cooperative.Document.ISignedDocument<Cooperative.Registry.AnnualGeneralMeetingAgenda.Action>;
  authorization: Cooperative.Document.ISignedDocument<Cooperative.Registry.SovietDecisionOnAnnualMeeting.Action>;
}

assertType<AssertKeysMatch<MeetContract.Tables.Meets.IOutput, MeetRowProcessingDomainInterface>>();
