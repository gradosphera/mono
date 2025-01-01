import type { TokenDomainInterface } from './token-domain.interface';

export interface TokensDomainInterface {
  access: TokenDomainInterface;
  refresh: TokenDomainInterface;
}
