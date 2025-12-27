import { Injectable, Inject, Logger } from '@nestjs/common';
import { VaultRepository, VAULT_REPOSITORY } from '../repositories/vault.repository';
import { decrypt, encrypt } from '~/utils/aes';
import { wifPermissions } from '../types/vault.types';
import type { SetWifInputDomainInterface } from '../interfaces';

/**
 * Токен для инъекции зависимости сервиса vault
 */
export const VAULT_DOMAIN_SERVICE = Symbol('VaultDomainService');

/**
 * Доменный сервис для работы с зашифрованными WIF ключами
 * Инкапсулирует бизнес-логику работы с приватными ключами пользователей
 */
@Injectable()
export class VaultDomainService {
  private readonly logger = new Logger(VaultDomainService.name);

  constructor(@Inject(VAULT_REPOSITORY) private readonly vaultRepository: VaultRepository) {}

  /**
   * Получает расшифрованный WIF ключ по имени пользователя
   * @param username - имя пользователя
   * @param permission - разрешение (по умолчанию Active)
   * @returns расшифрованный WIF ключ или null
   */
  async getWif(username: string, permission: wifPermissions = wifPermissions.Active): Promise<string | null> {
    try {
      const encryptedWif = await this.vaultRepository.getWif(username, permission);

      if (!encryptedWif) {
        this.logger.warn(`WIF ключ не найден для пользователя: ${username}, разрешение: ${permission}`);
        return null;
      }

      const decryptedWif = decrypt(encryptedWif);
      this.logger.log(`WIF ключ успешно получен для пользователя: ${username}`);

      return decryptedWif;
    } catch (error) {
      this.logger.error(`Ошибка при получении WIF ключа для пользователя ${username}:`, error);
      return null;
    }
  }

  /**
   * Устанавливает WIF ключ для пользователя (шифрует перед сохранением)
   * @param data - входные данные с WIF ключом
   * @returns true, если операция успешна
   */
  async setWif(data: SetWifInputDomainInterface): Promise<boolean> {
    try {
      const permission = data.permission || wifPermissions.Active;

      // Шифруем WIF перед сохранением
      const encryptedWif = encrypt(data.wif);

      const result = await this.vaultRepository.setWif(data.username, encryptedWif, permission);

      if (result) {
        this.logger.log(`WIF ключ успешно установлен для пользователя: ${data.username}, разрешение: ${permission}`);
      } else {
        this.logger.error(`Не удалось установить WIF ключ для пользователя: ${data.username}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Ошибка при установке WIF ключа для пользователя ${data.username}:`, error);
      return false;
    }
  }

  /**
   * Проверяет, существует ли WIF ключ для пользователя
   * @param username - имя пользователя
   * @param permission - разрешение (по умолчанию Active)
   * @returns true, если ключ существует
   */
  async hasWif(username: string, permission: wifPermissions = wifPermissions.Active): Promise<boolean> {
    const encryptedWif = await this.vaultRepository.getWif(username, permission);
    return encryptedWif !== null;
  }
}
