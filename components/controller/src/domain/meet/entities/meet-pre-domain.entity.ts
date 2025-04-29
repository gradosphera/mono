import type { MeetPreProcessingDomainInterface } from '../interfaces/meet-pre-domain.interface';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import type { AgendaMeetPointInputDomainInterface } from '../interfaces/agenda-meet-point-input-domain.interface';
export class MeetPreProcessingDomainEntity implements MeetPreProcessingDomainInterface {
  public readonly coopname!: string;
  public readonly hash!: string;
  public readonly initiator!: string;
  public readonly presider!: string;
  public readonly secretary!: string;
  public readonly agenda!: AgendaMeetPointInputDomainInterface[];
  public readonly open_at!: Date;
  public readonly close_at!: Date;
  public readonly proposal?: DocumentAggregateDomainInterface;

  constructor(data: MeetPreProcessingDomainInterface) {
    Object.assign(this, data);
  }
}
