/**
 * Доменный порт для операций с аккаунтами
 * Используется для регистрации блокчейн аккаунтов
 */
export interface AccountDomainPort {
  /**
   * Зарегистрировать блокчейн аккаунт для пользователя
   * @param username имя пользователя
   */
  registerBlockchainAccount(username: string): Promise<void>;
}

export const ACCOUNT_DOMAIN_PORT = Symbol('AccountDomainPort');
