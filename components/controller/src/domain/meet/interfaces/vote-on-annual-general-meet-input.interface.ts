/**
 * Интерфейс элемента голосования
 */
export interface VoteItemInputDomainInterface {
  question_id: string;
  vote: string;
}

/**
 * Доменный интерфейс для голосования на собрании
 */
export interface VoteOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  member: string;
  ballot: VoteItemInputDomainInterface[];
}
