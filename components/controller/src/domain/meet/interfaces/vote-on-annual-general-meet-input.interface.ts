import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Интерфейс элемента голосования
 */
export interface VoteItemInputDomainInterface {
  question_id: number;
  vote: string;
}

/**
 * Доменный интерфейс для голосования на собрании
 */
export interface VoteOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  username: string;
  votes: VoteItemInputDomainInterface[];
  ballot: ISignedDocumentDomainInterface;
}
