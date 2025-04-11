// domain/appstore/interactors/app.interactor.ts

import { Injectable } from '@nestjs/common';
import { ExtensionDomainService } from '../services/extension-domain.service';
import { ExtensionDomainEntity } from '../entities/extension-domain.entity';
import { ExtensionLifecycleDomainService } from '../services/extension-lifecycle-domain.service';

@Injectable()
export class ExtensionDomainInteractor<TConfig = any> {
  constructor(
    private readonly extensionDomainService: ExtensionDomainService<TConfig>,
    private readonly appLifecycleService: ExtensionLifecycleDomainService
  ) {}

  async runApps() {
    await this.appLifecycleService.runApps();
  }

  async runApp(name: string) {
    await this.appLifecycleService.runApp(name);
  }

  async restartApp(appName: string) {
    await this.appLifecycleService.restartApp(appName);
  }

  async terminateApp(appName: string) {
    await this.appLifecycleService.terminateApp(appName);
  }

  // Получение списка всех приложений
  async getAppList(filter?: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>[]> {
    return this.extensionDomainService.getAppList(filter);
  }

  async getApp(name: string): Promise<ExtensionDomainEntity<TConfig> | null> {
    return this.extensionDomainService.getAppByName(name);
  }

  async updateApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    const app = await this.extensionDomainService.updateApp(appData);
    if (app.enabled == false) await this.terminateApp(app.name);
    else this.restartApp(appData.name as string);

    return app;
  }

  // Установка нового приложения
  async installApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    // Установка нового приложения
    const app = await this.extensionDomainService.installApp(appData);
    // Запуск приложения
    if (appData.enabled) await this.runApp(app.name);

    return app;
  }

  // Установка нового приложения
  async uninstallApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<boolean> {
    if (!appData.name) throw new Error('Имя у приложения должно быть задано');

    // удаление приложения
    const result = await this.extensionDomainService.uninstallApp(appData);

    if (result) await this.terminateApp(appData.name as string);

    return result;
  }

  async installDefaultApps(): Promise<void> {
    const defaultApps = this.extensionDomainService.getDefaultApps();

    for (const app of defaultApps) {
      if (!app.name) throw new Error('Имя у приложения должно быть задано');
      const a = await this.extensionDomainService.getAppByName(app.name);
      if (!a) await this.extensionDomainService.installApp(app);
    }
  }
}
