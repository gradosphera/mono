import { wifPermissions } from '../types/vault.types';

/**
 * Доменная сущность для хранения зашифрованных WIF ключей
 * Представляет зашифрованный приватный ключ пользователя в чистом доменном виде
 */
export class VaultDomainEntity {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly permission: wifPermissions,
    public readonly wif: string, // Зашифрованный WIF ключ
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Проверяет, является ли разрешение активным
   */
  isActive(): boolean {
    return this.permission === wifPermissions.Active;
  }
}
