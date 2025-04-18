import type { MeetContract } from 'cooptypes';
import type { MeetProcessingDomainInterface } from '../interfaces/meet-processing-domain.interface';

export class MeetProcessingDomainEntity implements MeetProcessingDomainInterface {
  public readonly hash!: string;
  public readonly meet!: MeetContract.Tables.Meets.IOutput;
  public readonly questions!: MeetContract.Tables.Questions.IOutput[];

  constructor(data: MeetProcessingDomainInterface) {
    Object.assign(this, data);
  }
}
