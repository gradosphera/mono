import { Module } from '@nestjs/common';
import { SettingsDomainModule } from './settings-domain.module';
import { TypeOrmModule } from '~/infrastructure/database/typeorm/typeorm.module';

/**
 * Модуль настроек, объединяющий домен и инфраструктуру
 * Импортирует SettingsDomainModule и предоставляет репозиторий через TypeOrmModule
 */
@Module({
  imports: [SettingsDomainModule, TypeOrmModule],
  exports: [SettingsDomainModule],
})
export class SettingsModule {}
