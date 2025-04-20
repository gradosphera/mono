import type { MeetProcessingDomainInterface } from '../interfaces/meet-processing-domain.interface';
import type { MeetRowProcessingDomainInterface } from '../interfaces/meet-row-processing-domain.interface';
import type { QuestionRowProcessingDomainInterface } from '../interfaces/question-row-processing-domain.interface';
export class MeetProcessingDomainEntity implements MeetProcessingDomainInterface {
  public readonly hash!: string;
  public readonly meet!: MeetRowProcessingDomainInterface;
  public readonly questions!: QuestionRowProcessingDomainInterface[];

  constructor(data: MeetProcessingDomainInterface) {
    Object.assign(this, data);
  }
}
