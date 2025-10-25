import { Module } from '@nestjs/common';
import { SettingsDomainModule } from './settings-domain.module';

/**
 * Модуль настроек, объединяющий домен и инфраструктуру
 * Импортирует SettingsDomainModule и предоставляет репозиторий через TypeOrmModule
 */
@Module({
  imports: [SettingsDomainModule],
  exports: [SettingsDomainModule],
})
export class SettingsModule {}
