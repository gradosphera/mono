import type { TokenType } from '~/types/token.types';

/**
 * Интерфейс входных данных для создания токена
 */
export interface CreateTokenInputDomainInterface {
  token: string;
  userId: string;
  type: TokenType;
  expires: Date;
  blacklisted?: boolean;
}
