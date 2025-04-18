import type { MeetContract } from 'cooptypes';
import { assertType, type AssertKeysMatch } from '~/shared/asserts/blockchain-type.assert';

export interface QuestionRowProcessingDomainInterface {
  id: number;
  number: number;
  coopname: string;
  meet_id: number;
  title: string;
  context: string;
  decision: string;
  counter_votes_for: number;
  counter_votes_against: number;
  counter_votes_abstained: number;
  voters_for: string[];
  voters_against: string[];
  voters_abstained: string[];
}

assertType<AssertKeysMatch<MeetContract.Tables.Questions.IOutput, QuestionRowProcessingDomainInterface>>();
