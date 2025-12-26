import type { TokenType } from '~/types/token.types';

/**
 * Интерфейс входных данных для генерации токена
 */
export interface GenerateTokenInputDomainInterface {
  userId: string;
  expires: Date;
  type: TokenType;
  secret?: string;
}
