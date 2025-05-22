// === Processed ===
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

// Доменный интерфейс для обработанных собраний
export interface MeetProcessedDomainInterface {
  coopname: string;
  hash: string;
  results: any[];
  signed_ballots: number;
  quorum_percent: number;
  quorum_passed: boolean;
  decision: ISignedDocumentDomainInterface;
  // Агрегат не является частью доменной сущности,
  // он создается временно для передачи в DTO
}
