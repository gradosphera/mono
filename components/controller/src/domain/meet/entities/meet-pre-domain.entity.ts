import type { Cooperative } from 'cooptypes';
import type { IMeetPoint } from '../interfaces/agenda-meet-point-input-domain.interface';
import type { MeetPreProcessingDomainInterface } from '../interfaces/meet-pre-domain.interface';

export class MeetPreProcessingDomainEntity implements MeetPreProcessingDomainInterface {
  public readonly coopname!: string;
  public readonly type!: string;
  public readonly hash!: string;
  public readonly initiator!: string;
  public readonly presider!: string;
  public readonly secretary!: string;
  public readonly agenda!: IMeetPoint[];
  public readonly open_at!: Date;
  public readonly close_at!: Date;
  public readonly created_at!: Date;
  public readonly proposal?: Cooperative.Document.ISignedDocument<Cooperative.Registry.AnnualGeneralMeetingAgenda.Action>;

  constructor(data: MeetPreProcessingDomainInterface) {
    Object.assign(this, data);
  }
}
