/**
 * Интерфейс пары токенов (access + refresh)
 */
export interface TokenPairDomainInterface {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}
