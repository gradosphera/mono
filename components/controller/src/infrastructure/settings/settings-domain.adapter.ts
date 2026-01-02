import { Inject, Injectable } from '@nestjs/common';
import { SettingsDomainPort, SETTINGS_DOMAIN_PORT } from '~/domain/settings/ports/settings-domain.port';
import { SettingsInteractor } from '~/application/settings/interactors/settings.interactor';

/**
 * Адаптер инфраструктуры для работы с настройками
 * Реализует порт домена и делегирует вызовы интерактору приложения
 */
@Injectable()
export class SettingsDomainAdapter implements SettingsDomainPort {
  constructor(
    @Inject(SettingsInteractor)
    private readonly settingsInteractor: SettingsInteractor
  ) {}

  async getSettings() {
    return this.settingsInteractor.getSettings();
  }

  async updateSettings(updates: any) {
    return this.settingsInteractor.updateSettings(updates);
  }
}
