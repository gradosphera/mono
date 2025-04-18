import type { BlockchainActionDomainInterface } from '../../common/interfaces/blockchain-action-domain.interface';
import type { Cooperative } from 'cooptypes';

export interface ExtendedBlockchainActionDomainInterface extends BlockchainActionDomainInterface {
  user?:
    | Cooperative.Users.IIndividualData
    | Cooperative.Users.IEntrepreneurData
    | Cooperative.Users.IOrganizationData
    | null;
}
