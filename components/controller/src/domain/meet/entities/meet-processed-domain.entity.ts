import type { MeetContract } from 'cooptypes';
import type { MeetProcessedDomainInterface } from '../interfaces/meet-processed-domain.interface';
import type { BlockchainActionDomainInterface } from '~/domain/common/interfaces/blockchain-action-domain.interface';

export class MeetProcessedDomainEntity implements MeetProcessedDomainInterface {
  public readonly hash!: string;
  public readonly decision!: BlockchainActionDomainInterface<MeetContract.Actions.NewDecision.IInput>;

  constructor(data: MeetProcessedDomainInterface) {
    Object.assign(this, data);
  }
}
