import { Module } from '@nestjs/common';
import { SettingsDomainInteractor } from './interactors/settings.interactor';

/**
 * Модуль доменного слоя для работы с настройками
 */
@Module({
  providers: [SettingsDomainInteractor],
  exports: [SettingsDomainInteractor],
})
export class SettingsDomainModule {}
