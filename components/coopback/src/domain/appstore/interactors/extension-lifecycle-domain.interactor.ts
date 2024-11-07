// domain/appstore/interactors/AppLifecycleManagementInteractor.ts

import { Injectable } from '@nestjs/common';
import { ExtensionLifecycleDomainService } from '../services/extension-lifecycle-domain.service';

@Injectable()
export class ExtensionLifecycleDomainInteractor {
  constructor(private readonly appLifecycleService: ExtensionLifecycleDomainService) {}

  async runApps() {
    await this.appLifecycleService.runApps();
  }

  async restartApp(appName: string) {
    await this.appLifecycleService.restartApp(appName);
  }

  async terminateApp(appName: string) {
    await this.appLifecycleService.terminateApp(appName);
  }
}
