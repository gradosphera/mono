// domain/appstore/interactors/app.interactor.ts

import { Injectable } from '@nestjs/common';
import { ExtensionDomainService } from '../services/extension-domain.service';
import { ExtensionDomainEntity } from '../entities/extension-domain.entity';

@Injectable()
export class ExtensionDomainInteractor<TConfig = any> {
  constructor(private readonly extensionDomainService: ExtensionDomainService<TConfig>) {}

  // Получение списка всех приложений
  async getAppList(): Promise<ExtensionDomainEntity<TConfig>[]> {
    return this.extensionDomainService.getAppList();
  }

  // Установка нового приложения
  async installApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    // Установка нового приложения
    return this.extensionDomainService.installApp(appData);
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
