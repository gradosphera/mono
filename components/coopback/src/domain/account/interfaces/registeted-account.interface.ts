import type { AccountDomainEntity } from '../entities/account-domain.entity';
import type { TokensDomainInterface } from './tokens-domain.interface';

export interface RegisteredAccountDomainInterface {
  account: AccountDomainEntity;
  tokens: TokensDomainInterface;
}
