// domain/appstore/interactors/AppLifecycleManagementInteractor.ts

import { Injectable } from '@nestjs/common';
import { AppLifecycleDomainService } from '../services/app-lifecycle-domain.service';

@Injectable()
export class AppLifecycleDomainInteractor {
  constructor(private readonly appLifecycleService: AppLifecycleDomainService) {}

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
