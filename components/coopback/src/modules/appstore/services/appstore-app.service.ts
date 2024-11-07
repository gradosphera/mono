// modules/appstore/services/AppManagement.service.ts

import { Injectable } from '@nestjs/common';
import { ExtensionDomainInteractor } from '~/domain/extension/interactors/extension-domain.interactor';
import { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';

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
