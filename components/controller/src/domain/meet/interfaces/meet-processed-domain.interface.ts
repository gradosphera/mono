// === Processed ===

import type { MeetContract } from 'cooptypes';
import type { BlockchainActionDomainInterface } from '~/domain/common/interfaces/blockchain-action-domain.interface';

export interface MeetProcessedDomainInterface {
  hash: string;
  decision: BlockchainActionDomainInterface<MeetContract.Actions.NewDecision.IInput>;
  //documents
}
