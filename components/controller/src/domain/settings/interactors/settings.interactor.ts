import { Inject, Injectable } from '@nestjs/common';
import { SETTINGS_REPOSITORY, SettingsRepository } from '../repositories/settings.repository';
import { SettingsDomainEntity } from '../entities/settings-domain.entity';
import type { UpdateSettingsInputDomainInterface } from '../interfaces/update-settings-input-domain.interface';
import config from '~/config/config';

/**
 * Интерактор для работы с настройками системы
 * Реализует бизнес-логику управления настройками
 */
@Injectable()
export class SettingsDomainInteractor {
  constructor(@Inject(SETTINGS_REPOSITORY) private readonly settingsRepository: SettingsRepository) {}

  /**
   * Получает настройки кооператива
   * Если настройки не найдены, создает дефолтные
   */
  async getSettings(): Promise<SettingsDomainEntity> {
    const settings = await this.settingsRepository.get(config.coopname);

    if (!settings) {
      // Если настроек нет, создаем дефолтные
      const defaultSettings = SettingsDomainEntity.createDefault(config.coopname);
      const created = await this.settingsRepository.upsert(defaultSettings);
      return new SettingsDomainEntity(created);
    }

    return new SettingsDomainEntity(settings);
  }

  /**
   * Обновляет настройки кооператива
   * @param updates - объект с полями для обновления
   */
  async updateSettings(updates: UpdateSettingsInputDomainInterface): Promise<SettingsDomainEntity> {
    // Получаем текущие настройки или создаем дефолтные
    const currentSettings = await this.getSettings();

    // Обновляем настройки
    currentSettings.update(updates);

    // Сохраняем обновленные настройки
    const updated = await this.settingsRepository.upsert(currentSettings);

    return new SettingsDomainEntity(updated);
  }
}
