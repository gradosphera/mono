// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { ExtensionDomainService } from './services/extension-domain.service';
import { ExtensionLifecycleDomainService } from '~/domain/extension/services/extension-lifecycle-domain.service';
import { ExtensionDomainListingService } from './services/extension-listing-domain.service';
import { ExtensionSchemaMigrationService } from './services/extension-schema-migration.service';
import { ExtensionInteractor } from '~/application/appstore/interactors/extension.interactor';
import { powerupSchemaV2Migration } from '~/extensions/powerup/migrations/powerup-schema-v2.migration';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';

import { ExtensionsModule } from '~/extensions/extensions.module';
import { nestApp } from '~/index';
import { ExtensionPortsModule } from './extension-ports.module';

@Module({
  imports: [
    ExtensionsModule.register(), // Регистрируем модуль расширений
    ExtensionPortsModule, // Импортируем модуль с портами
  ],
  providers: [
    ExtensionDomainService,
    ExtensionLifecycleDomainService,
    ExtensionDomainListingService,
    ExtensionSchemaMigrationService,
    ExtensionInteractor,
  ],
  exports: [
    ExtensionDomainService,
    ExtensionLifecycleDomainService,
    ExtensionDomainListingService,
    ExtensionSchemaMigrationService,
    ExtensionPortsModule, // Экспортируем модуль с портами
  ], // Экспортируем сервисы для использования в других модулях
})
export class ExtensionDomainModule {
  constructor(
    private readonly extensionLifecycleDomainService: ExtensionLifecycleDomainService,
    private readonly migrationService: ExtensionSchemaMigrationService,
    private readonly extensionInteractor: ExtensionInteractor,
    private readonly logger: WinstonLoggerService
  ) {}

  async onModuleInit() {
    this.logger.info('[EXTENSION_INIT] Начинаем инициализацию системы расширений');

    // Регистрируем миграции схем расширений
    this.migrationService.registerMigration(powerupSchemaV2Migration);

    // Устанавливаем расширения по умолчанию
    await this.extensionInteractor.installDefaultApps();

    this.extensionLifecycleDomainService.setAppContext(nestApp);

    // Запускаем инициализацию включенных расширений
    await this.extensionLifecycleDomainService.runApps();

    this.logger.info('[EXTENSION_INIT] Инициализация системы расширений завершена успешно');
  }
}
