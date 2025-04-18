import type { MeetRowProcessingDomainInterface } from './meet-row-processing-domain.interface';
import type { QuestionRowProcessingDomainInterface } from './question-row-processing-domain.interface';

// === Processing ===

export interface MeetProcessingDomainInterface {
  hash: string;
  meet: MeetRowProcessingDomainInterface;
  questions: QuestionRowProcessingDomainInterface[];
}
