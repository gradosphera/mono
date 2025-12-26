import type { TokenType } from '~/types/token.types';

/**
 * Основной доменный интерфейс токена
 */
export interface TokenDomainInterface {
  id?: string;
  token: string;
  userId: string;
  type: TokenType;
  expires: Date;
  blacklisted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
