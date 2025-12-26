import type { TokenType } from '~/types/token.types';

/**
 * Интерфейс входных данных для верификации токена
 */
export interface VerifyTokenInputDomainInterface {
  token: string;
  types: TokenType[];
}
