import { Module } from '@nestjs/common';
import { SettingsDomainAdapter } from './settings-domain.adapter';
import { SETTINGS_DOMAIN_PORT } from '~/domain/settings/ports/settings-domain.port';
import { SettingsApplicationModule } from '~/application/settings/settings.module';

/**
 * Инфраструктурный модуль для работы с настройками
 * Предоставляет адаптер, реализующий порт домена
 */
@Module({
  imports: [SettingsApplicationModule],
  providers: [
    {
      provide: SETTINGS_DOMAIN_PORT,
      useClass: SettingsDomainAdapter,
    },
  ],
  exports: [SETTINGS_DOMAIN_PORT],
})
export class SettingsInfrastructureModule {}
