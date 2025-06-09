import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменный интерфейс для перезапуска собрания
 */
export interface RestartAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  hash: string;
  newproposal: ISignedDocumentDomainInterface;
  new_open_at: Date;
  new_close_at: Date;
}
