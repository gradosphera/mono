// domain/appstore/appstore-lifecycle-domain.service.ts

import { Injectable } from '@nestjs/common';
import { AppStoreDomainService } from '~/domain/appstore/services/appstore-domain.service';
import { AppRegistry } from '~/config/app.registry';
import logger from '~/config/logger';

@Injectable()
export class AppLifecycleDomainService<TConfig = any> {
  private activeAppMap: { [key: string]: { appInstance: any } } = {};

  constructor(private readonly appStoreDomainService: AppStoreDomainService<TConfig>) {}

  async runApps() {
    const apps = await this.appStoreDomainService.getAppList();
    for (const appData of apps) {
      if (AppRegistry[appData.name]) {
        await this.runApp(appData.name);
      }
    }
  }

  async runApp(appName: string) {
    if (this.activeAppMap[appName]) {
      logger.info(`App ${appName} is already running.`);
      return;
    }

    const appData = await this.appStoreDomainService.getAppByName(appName);
    if (!appData || !appData.enabled) {
      logger.warn(`App ${appName} not found or disabled.`);
      return;
    }

    const AppClass = AppRegistry[appName].Plugin;
    const appInstance = new AppClass();

    if (typeof appInstance.initialize === 'function') {
      await appInstance.initialize();
    }

    this.activeAppMap[appName] = { appInstance };
    logger.info(`App ${appName} successfully started.`);
  }

  async terminateApp(appName: string) {
    const appData = this.activeAppMap[appName];
    if (appData) {
      delete this.activeAppMap[appName];
      logger.info(`App ${appName} terminated.`);
    } else {
      logger.warn(`App ${appName} not found.`);
    }
  }

  async restartApp(appName: string) {
    await this.terminateApp(appName);
    await this.runApp(appName);
    logger.info(`App ${appName} restarted.`);
  }
}
