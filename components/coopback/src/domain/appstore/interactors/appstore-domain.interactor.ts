// domain/appstore/interactors/app.interactor.ts

import { Injectable } from '@nestjs/common';
import { AppStoreDomainService } from '../services/appstore-domain.service';
import { AppStoreDomainEntity } from '../entities/appstore-domain.entity';

@Injectable()
export class AppStoreDomainInteractor<TConfig = any> {
  constructor(private readonly appStoreDomainService: AppStoreDomainService<TConfig>) {}

  // Получение списка всех приложений
  async getAppList(): Promise<AppStoreDomainEntity<TConfig>[]> {
    return this.appStoreDomainService.getAppList();
  }

  // Установка нового приложения
  async installApp(appData: Partial<AppStoreDomainEntity<TConfig>>): Promise<AppStoreDomainEntity<TConfig>> {
    // Установка нового приложения
    return this.appStoreDomainService.installApp(appData);
  }

  async installDefaultApps(): Promise<void> {
    const defaultApps = this.appStoreDomainService.getDefaultApps();

    for (const app of defaultApps) {
      if (!app.name) throw new Error('Имя у приложения должно быть задано');

      const a = await this.appStoreDomainService.getAppByName(app.name);
      if (!a) await this.appStoreDomainService.installApp(app);
    }
  }
}
