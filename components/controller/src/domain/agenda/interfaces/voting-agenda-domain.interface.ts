import type { SovietContract } from 'cooptypes';
import type { BlockchainActionDomainInterface } from '../../common/interfaces/blockchain-action-domain.interface';

export interface VotingAgendaDomainInterface {
  table: SovietContract.Tables.Decisions.IDecision;
  action: BlockchainActionDomainInterface;
}
