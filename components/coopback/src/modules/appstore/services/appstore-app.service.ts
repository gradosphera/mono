// modules/appstore/services/AppManagement.service.ts

import { Injectable } from '@nestjs/common';
import { AppStoreDomainInteractor } from '~/domain/appstore/interactors/appstore-domain.interactor';
import { AppStoreDomainEntity } from '~/domain/appstore/entities/appstore-domain.entity';

@Injectable()
export class AppManagementService<TConfig = any> {
  constructor(private readonly appStoreDomainInteractor: AppStoreDomainInteractor<TConfig>) {}

  async installApp(appData: Partial<AppStoreDomainEntity<TConfig>>): Promise<AppStoreDomainEntity<TConfig>> {
    return this.appStoreDomainInteractor.installApp(appData);
  }

  async getAppList(): Promise<AppStoreDomainEntity<TConfig>[]> {
    return this.appStoreDomainInteractor.getAppList();
  }
}
