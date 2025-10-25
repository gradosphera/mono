import type { SettingsDomainInterface } from '../interfaces/settings-domain.interface';
import type { UpdateSettingsInputDomainInterface } from '../interfaces/update-settings-input-domain.interface';

/**
 * Репозиторий для работы с настройками системы
 * Определяет контракт для работы с хранилищем настроек
 */
export interface SettingsRepository {
  /**
   * Получает настройки кооператива
   * @param coopname - название кооператива
   * @returns настройки или null, если не найдены
   */
  get(coopname: string): Promise<SettingsDomainInterface | null>;

  /**
   * Создает или обновляет настройки кооператива
   * @param settings - объект настроек
   */
  upsert(settings: SettingsDomainInterface): Promise<SettingsDomainInterface>;

  /**
   * Обновляет настройки кооператива частично
   * @param coopname - название кооператива
   * @param updates - объект с полями для обновления
   */
  update(coopname: string, updates: UpdateSettingsInputDomainInterface): Promise<SettingsDomainInterface>;
}

/**
 * Токен для инъекции зависимости репозитория настроек
 */
export const SETTINGS_REPOSITORY = Symbol('SettingsRepository');
