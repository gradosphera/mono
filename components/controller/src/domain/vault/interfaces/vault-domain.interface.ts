import type { wifPermissions } from '../types/vault.types';

/**
 * Основной доменный интерфейс для vault
 */
export interface VaultDomainInterface {
  id: string;
  username: string;
  permission: wifPermissions;
  wif: string; // Зашифрованный WIF ключ
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Интерфейс для входных данных установки WIF
 */
export interface SetWifInputDomainInterface {
  username: string;
  wif: string; // Исходный (незашифрованный) WIF ключ
  permission?: wifPermissions;
}

/**
 * Интерфейс для входных данных получения WIF
 */
export interface GetWifInputDomainInterface {
  username: string;
  permission?: wifPermissions;
}
