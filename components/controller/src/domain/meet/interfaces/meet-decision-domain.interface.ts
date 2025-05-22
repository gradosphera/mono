import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export interface MeetQuestionResultDomainInterface {
  question_id: number;
  title: string;
  decision: string;
  context: string;
  votes_for: number;
  votes_against: number;
  votes_abstained: number;
  accepted: boolean;
}

export interface MeetDecisionDomainInterface {
  coopname: string;
  hash: string;
  results: MeetQuestionResultDomainInterface[];
  signed_ballots: number;
  quorum_percent: number;
  quorum_passed: boolean;
  decision: ISignedDocumentDomainInterface;
}
