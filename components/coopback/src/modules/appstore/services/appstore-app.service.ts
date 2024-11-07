// modules/appstore/services/AppManagement.service.ts

import { Injectable } from '@nestjs/common';
import { ExtensionDomainInteractor } from '~/domain/appstore/interactors/extension-domain.interactor';
import { ExtensionDomainEntity } from '~/domain/appstore/entities/extension-domain.entity';

@Injectable()
export class AppManagementService<TConfig = any> {
  constructor(private readonly extensionDomainInteractor: ExtensionDomainInteractor<TConfig>) {}

  async installApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    return this.extensionDomainInteractor.installApp(appData);
  }

  async getAppList(): Promise<ExtensionDomainEntity<TConfig>[]> {
    return this.extensionDomainInteractor.getAppList();
  }
}
