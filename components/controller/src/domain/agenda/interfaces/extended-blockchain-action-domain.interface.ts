import type { BlockchainActionDomainInterface } from '../../common/interfaces/blockchain-action-domain.interface';
import type { UserCertificateDomainInterface } from '~/domain/user/interfaces/user-certificate-domain.interface';

export interface ExtendedBlockchainActionDomainInterface extends BlockchainActionDomainInterface {
  actor_certificate?: UserCertificateDomainInterface | null;
}
