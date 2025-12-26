import type { TokenType } from '~/types/token.types';

/**
 * Доменная сущность токена
 * Представляет токен в чистом доменном виде без привязки к конкретной БД
 */
export class TokenDomainEntity {
  constructor(
    public readonly token: string,
    public readonly userId: string,
    public readonly type: TokenType,
    public readonly expires: Date,
    public readonly blacklisted: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly id?: string
  ) {}

  /**
   * Проверяет, истек ли токен
   */
  isExpired(): boolean {
    return new Date() > this.expires;
  }

  /**
   * Проверяет, является ли токен валидным (не истек и не в черном списке)
   */
  isValid(): boolean {
    return !this.isExpired() && !this.blacklisted;
  }

  /**
   * Создает новый токен с обновленной датой истечения
   */
  withNewExpiration(newExpires: Date): TokenDomainEntity {
    return new TokenDomainEntity(
      this.token,
      this.userId,
      this.type,
      newExpires,
      this.blacklisted,
      this.createdAt,
      new Date(),
      this.id
    );
  }

  /**
   * Помечает токен как заблокированный
   */
  blacklist(): TokenDomainEntity {
    return new TokenDomainEntity(
      this.token,
      this.userId,
      this.type,
      this.expires,
      true,
      this.createdAt,
      new Date(),
      this.id
    );
  }
}
