// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { ExtensionDomainInteractor } from './interactors/extension-domain.interactor';
import { ExtensionDomainService } from './services/extension-domain.service';
import { ExtensionLifecycleDomainService } from '~/domain/extension/services/extension-lifecycle-domain.service';
import { ExtensionDomainListingService } from './services/extension-listing-domain.service';
import { ExtensionDomainListingInteractor } from './interactors/extension-listing-domain.interactor';

import { ExtensionsModule } from '~/extensions/extensions.module';
import { nestApp } from '~/index';

@Module({
  imports: [
    ExtensionsModule.register(), // Регистрируем модуль расширений с доступом ко всем плагинам
  ],
  providers: [
    ExtensionDomainInteractor,
    ExtensionDomainService,
    ExtensionDomainInteractor,
    ExtensionLifecycleDomainService,
    ExtensionDomainListingService,
    ExtensionDomainListingInteractor,
  ],
  exports: [
    ExtensionDomainInteractor,
    ExtensionDomainService,
    ExtensionDomainListingService,
    ExtensionDomainListingInteractor,
  ], // Экспортируем интерактор и сервис для использования в других модулях
})
export class ExtensionDomainModule {
  constructor(
    private readonly extensionDomainInteractor: ExtensionDomainInteractor,
    private readonly extensionLifecycleDomainService: ExtensionLifecycleDomainService
  ) {}

  async onModuleInit() {
    this.extensionLifecycleDomainService.setAppContext(nestApp);
    await this.extensionDomainInteractor.installDefaultApps();
    await this.extensionDomainInteractor.runApps();
  }
}
