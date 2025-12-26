/**
 * Интерфейс сервисного токена
 */
export interface ServiceTokenDomainInterface {
  access: {
    token: string;
    expires: Date;
  };
}
