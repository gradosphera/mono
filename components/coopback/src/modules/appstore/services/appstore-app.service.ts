import { Injectable } from '@nestjs/common';
import { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import { ExtensionGraphQLDTO } from '../dto/extension-graphql.dto';
import zodToJsonSchema from 'zod-to-json-schema';
import { AppRegistry, type IRegistryExtension } from '~/extensions/extensions.registry';
import { ExtensionGraphQLInput } from '../dto/extension-graphql-input.dto';
import { ExtensionDomainInteractor } from '~/domain/extension/interactors/extension-domain.interactor';
import type { GetExtensionsGraphQLInput } from '../dto/get-extensions-input.dto';
import type { UninstallExtensionGraphQLInput } from '../dto/uninstall-extension-input.dto';

@Injectable()
export class AppManagementService<TConfig = any> {
  constructor(private readonly extensionDomainInteractor: ExtensionDomainInteractor<TConfig>) {}

  // Метод для получения данных о конкретном приложении
  async getCombinedApp(name: string): Promise<ExtensionGraphQLDTO<TConfig> | null> {
    const appRegistryData = await this.extractAppRegistryData();
    const registryData = appRegistryData[name];

    if (!registryData) return null;

    const installedExtension = await this.extensionDomainInteractor.getApp(name);
    return await this.buildAppData(name, installedExtension, registryData);
  }

  validateConfig(name: string, config: any): boolean {
    const appConfigSchema = AppRegistry[name].schema;

    if (!appConfigSchema) throw new Error(`Приложение не найдено в реестре`);

    // Валидация данных
    const result = appConfigSchema.safeParse(config);

    if (result.success) {
      return true;
    } else {
      // Создание детализированного сообщения об ошибках
      const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      throw new Error(`Ошибка валидации конфигурации: ${errors}`);
    }
  }

  async installApp(appData: ExtensionGraphQLInput): Promise<ExtensionGraphQLDTO<TConfig>> {
    this.validateConfig(appData.name, appData.config);

    await this.extensionDomainInteractor.installApp(appData);

    const app = await this.getCombinedApp(appData.name);

    if (!app) {
      throw new Error(`Возникла ошибка при установке`);
    }

    return app;
  }

  async uninstallApp(appData: UninstallExtensionGraphQLInput): Promise<boolean> {
    return this.extensionDomainInteractor.uninstallApp(appData);
  }

  async updateApp(appData: ExtensionGraphQLInput): Promise<ExtensionGraphQLDTO<TConfig>> {
    this.validateConfig(appData.name, appData.config);

    await this.extensionDomainInteractor.updateApp(appData);

    const app = await this.getCombinedApp(appData.name);

    if (!app) throw new Error(`Возникла ошибка при обновлении`);

    return app;
  }

  async getAppList(filter?: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>[]> {
    return this.extensionDomainInteractor.getAppList(filter);
  }

  // Асинхронный метод для извлечения данных приложения из AppRegistry, включая readme и instructions
  private async extractAppRegistryData() {
    const appRegistryData: Record<string, any> = {};
    for (const [key, { schema, title, description, image, tags, available, readme, instructions }] of Object.entries(
      AppRegistry
    )) {
      appRegistryData[key] = {
        schema: zodToJsonSchema(schema),
        title,
        description,
        image,
        tags,
        available,
        readme: await readme,
        instructions: await instructions,
      };
    }
    return appRegistryData;
  }

  // Асинхронная функция для сборки данных об одном приложении
  private async buildAppData(
    key: string,
    installedExtension: ExtensionDomainEntity<TConfig> | null,
    registryData: IRegistryExtension
  ): Promise<ExtensionGraphQLDTO<TConfig>> {
    const registrySchema = registryData.schema || null;
    const registryTitle = registryData.title || '';
    const registryDescription = registryData.description || '';
    const registryImage = registryData.image || '';
    const registryTags = registryData.tags || [];
    const registryAvailable = registryData.available || false;
    const registryReadme = (await registryData.readme) || '';
    const registryInstructions = (await registryData.instructions) || '';

    return new ExtensionGraphQLDTO(
      key,
      registryAvailable,
      !!installedExtension,
      installedExtension?.enabled || false,
      installedExtension?.config || ({} as TConfig),
      installedExtension?.created_at || new Date(0),
      installedExtension?.updated_at || new Date(0),
      registrySchema,
      registryTitle,
      registryDescription,
      registryImage,
      registryTags,
      registryReadme,
      registryInstructions
    );
  }

  // Метод для объединения данных всех приложений из AppRegistry и данных из базы
  async getCombinedAppList(filter?: GetExtensionsGraphQLInput): Promise<ExtensionGraphQLDTO<TConfig>[]> {
    const appRegistryData = await this.extractAppRegistryData();
    const installed = await this.getAppList();

    // Создаем карту, объединяя данные AppRegistry и установленных приложений
    const combinedData = new Map<string, ExtensionGraphQLDTO<TConfig>>();

    // Добавляем данные из AppRegistry
    for (const key of Object.keys(appRegistryData)) {
      combinedData.set(key, await this.buildAppData(key, null, appRegistryData[key]));
    }

    // Дополняем данными из установленных приложений
    for (const ext of installed) {
      const registryData = appRegistryData[ext.name] || {};
      combinedData.set(ext.name, await this.buildAppData(ext.name, ext, registryData));
    }

    // Применение фильтров инлайн
    let result = Array.from(combinedData.values());
    if (filter) {
      result = result.filter((ext) => Object.entries(filter).every(([key, value]) => ext[key] === value));
    }

    return result;
  }
}
