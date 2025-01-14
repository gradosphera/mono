// domain/appstore/appstore-lifecycle-domain.service.ts

import { Injectable, type INestApplication } from '@nestjs/common';
import { ExtensionDomainService } from '~/domain/extension/services/extension-domain.service';
import { AppRegistry } from '~/extensions/extensions.registry';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';

@Injectable()
export class ExtensionLifecycleDomainService<TConfig = any> {
  private activeAppMap: { [key: string]: { appInstance: any } } = {};
  private appContext!: INestApplication;

  constructor(
    private readonly extensionDomainService: ExtensionDomainService<TConfig>,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ExtensionLifecycleDomainService.name);
  }

  setAppContext(appContext: INestApplication) {
    this.appContext = appContext;
  }

  async runApps() {
    const apps = await this.extensionDomainService.getAppList({ enabled: true });
    for (const appData of apps) {
      if (AppRegistry[appData.name]) {
        await this.runApp(appData.name);
      }
    }
  }

  async runApp(appName: string) {
    if (this.activeAppMap[appName]) {
      this.logger.info(`Расширение ${appName} уже запущено.`);
      return;
    }

    const appData = await this.extensionDomainService.getAppByName(appName);
    if (!appData || !appData.enabled) {
      this.logger.info(`Расширение ${appName} не найдено или отключено.`);
      return;
    }

    const AppClass = AppRegistry[appName]; // Получаем класс модуля из реестра
    const appInstance = this.appContext.get(AppClass.class); // Получаем инстанс модуля напрямую

    await appInstance.initialize(appData.config); // Вызываем инициализацию модуля
    this.activeAppMap[appName] = { appInstance }; // Сохраняем модуль как appInstance

    this.logger.info(`Расширение ${appName} успешно запущено.`);
  }

  async terminateApp(appName: string) {
    const appData = this.activeAppMap[appName];
    if (appData) {
      delete this.activeAppMap[appName];
      this.logger.info(`Расширение ${appName} остановлено.`);
    } else {
      this.logger.info(`Расширение ${appName} не найдено.`);
    }
  }

  async restartApp(appName: string) {
    await this.terminateApp(appName);
    await this.runApp(appName);
    this.logger.info(`Расширение ${appName} перезапущено.`);
  }
}
