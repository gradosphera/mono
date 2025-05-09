import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменный интерфейс для закрытия собрания
 */
export interface CloseAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  meet_decision: ISignedDocumentDomainInterface;
}
