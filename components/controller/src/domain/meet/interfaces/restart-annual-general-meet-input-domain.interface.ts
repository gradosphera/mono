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
  /** Если передано — пишем в meet_pre нового hash; если в мутации не передано — details у нового pre пустой (старый pre не подмешиваем) */
  details?: string | null;
}
