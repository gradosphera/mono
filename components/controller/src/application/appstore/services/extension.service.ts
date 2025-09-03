// ./modules/appstore/app-management.service.ts
import { Injectable } from '@nestjs/common';
import { ExtensionDTO } from '../dto/extension-graphql.dto';
import { ExtensionGraphQLInput } from '../dto/extension-graphql-input.dto';
import { GetExtensionsGraphQLInput } from '../dto/get-extensions-input.dto';
import { UninstallExtensionGraphQLInput } from '../dto/uninstall-extension-input.dto';
import { ExtensionDomainInteractor } from '~/domain/extension/interactors/extension-domain.interactor';
import { ExtensionDomainListingInteractor } from '~/domain/extension/interactors/extension-listing-domain.interactor';

/**
 * Application-слой, который:
 *  1) делегирует установку/удаление в старый интерактор
 *  2) для объединённого списка вызывает новый listingInterator
 */
@Injectable()
export class AppManagementService<TConfig = any> {
  constructor(
    private readonly extensionDomainInteractor: ExtensionDomainInteractor<TConfig>,
    private readonly listingInteractor: ExtensionDomainListingInteractor<TConfig>
  ) {}

  // Установка
  async installApp(data: ExtensionGraphQLInput<TConfig>): Promise<ExtensionDTO<TConfig>> {
    // Валидируем конфиг
    this.listingInteractor.validateConfig(data.name, data.config);
    // Устанавливаем
    await this.extensionDomainInteractor.installApp(data);
    // Собираем DTO из нового listingInteractor
    const app = await this.listingInteractor.getCombinedApp(data.name);
    if (!app) throw new Error('Не удалось собрать данные о расширении');
    return app;
  }

  // Удаление
  async uninstallApp(data: UninstallExtensionGraphQLInput): Promise<boolean> {
    return this.extensionDomainInteractor.uninstallApp(data);
  }

  // Обновление
  async updateApp(data: ExtensionGraphQLInput<TConfig>): Promise<ExtensionDTO<TConfig>> {
    this.listingInteractor.validateConfig(data.name, data.config);
    await this.extensionDomainInteractor.updateApp(data);

    const app = await this.listingInteractor.getCombinedApp(data.name);
    if (!app) throw new Error('Не удалось собрать данные о расширении');
    return app;
  }

  // Получить "один" расширение (DTO)
  async getCombinedApp(name: string): Promise<ExtensionDTO<TConfig> | null> {
    return this.listingInteractor.getCombinedApp(name);
  }

  // Получить список (DTO)
  async getCombinedAppList(filter?: GetExtensionsGraphQLInput): Promise<ExtensionDTO<TConfig>[]> {
    return this.listingInteractor.getCombinedAppList(filter);
  }
}
