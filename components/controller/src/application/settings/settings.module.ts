import { Module } from '@nestjs/common';
import { SettingsInteractor } from './interactors/settings.interactor';

/**
 * Модуль настроек на уровне приложения
 * Предоставляет интерактор для оркестрации работы с настройками
 */
@Module({
  imports: [],
  providers: [SettingsInteractor],
  exports: [SettingsInteractor],
})
export class SettingsApplicationModule {}
