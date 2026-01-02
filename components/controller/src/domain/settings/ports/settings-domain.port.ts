import { SettingsDomainEntity } from '../entities/settings-domain.entity';
import type { UpdateSettingsInputDomainInterface } from '../interfaces/update-settings-input-domain.interface';

/**
 * Порт домена для работы с настройками
 * Определяет интерфейс взаимодействия с настройками на уровне домена
 */
export abstract class SettingsDomainPort {
  /**
   * Получает настройки кооператива
   */
  abstract getSettings(): Promise<SettingsDomainEntity>;

  /**
   * Обновляет настройки кооператива
   */
  abstract updateSettings(updates: UpdateSettingsInputDomainInterface): Promise<SettingsDomainEntity>;
}

/**
 * Токен для внедрения SettingsDomainPort
 */
export const SETTINGS_DOMAIN_PORT = Symbol('SETTINGS_DOMAIN_PORT');
