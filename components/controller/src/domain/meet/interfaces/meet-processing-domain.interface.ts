import type { MeetRowProcessingDomainInterface } from './meet-row-processing-domain.interface';
import type { QuestionRowProcessingDomainInterface } from './question-row-processing-domain.interface';
import { ExtendedMeetStatus } from '../enums/extended-meet-status.enum';

// === Processing ===

export interface MeetProcessingDomainInterface {
  hash: string;
  meet: MeetRowProcessingDomainInterface;
  questions: QuestionRowProcessingDomainInterface[];
  isVoted?: boolean;
  extendedStatus?: ExtendedMeetStatus;
}
