import type { VaultDomainEntity } from '../entities/vault-domain.entity';
import type { wifPermissions } from '../types/vault.types';

/**
 * Репозиторий для работы с зашифрованными WIF ключами
 * Определяет контракт для работы с хранилищем WIF ключей
 */
export interface VaultRepository {
  /**
   * Получает WIF ключ по имени пользователя и разрешению
   * @param username - имя пользователя
   * @param permission - разрешение (по умолчанию Active)
   * @returns зашифрованный WIF ключ или null
   */
  getWif(username: string, permission?: wifPermissions): Promise<string | null>;

  /**
   * Устанавливает/обновляет WIF ключ для пользователя
   * @param username - имя пользователя
   * @param wif - зашифрованный WIF ключ
   * @param permission - разрешение (по умолчанию Active)
   * @returns true, если операция успешна
   */
  setWif(username: string, wif: string, permission?: wifPermissions): Promise<boolean>;

  /**
   * Находит запись vault по имени пользователя и разрешению
   * @param username - имя пользователя
   * @param permission - разрешение
   * @returns доменная сущность или null
   */
  findByUsernameAndPermission(username: string, permission: wifPermissions): Promise<VaultDomainEntity | null>;
}

/**
 * Токен для инъекции зависимости репозитория vault
 */
export const VAULT_REPOSITORY = Symbol('VaultRepository');
