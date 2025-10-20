import { Injectable } from '@nestjs/common';
import config from '~/config/config';
import { ExtensionDomainListingInteractor } from '~/domain/extension/interactors/extension-listing-domain.interactor';
import { DesktopDomainEntity } from '../entities/desktop-domain.entity';
import { DesktopWorkspaceDomainEntity } from '../entities/workspace-domain.entity';
import { AppRegistry } from '~/extensions/extensions.registry';

@Injectable()
export class DesktopDomainInteractor {
  constructor(private readonly extensionDomainListingInteractor: ExtensionDomainListingInteractor) {}

  async getDesktop(): Promise<DesktopDomainEntity> {
    // Получаем установленные desktop расширения
    const apps = await this.extensionDomainListingInteractor.getCombinedAppList({
      is_installed: true,
      is_desktop: true,
      is_available: true,
      enabled: true,
    });

    // Разворачиваем массивы desktops из каждого расширения
    const workspaces: DesktopWorkspaceDomainEntity[] = [];

    for (const app of apps) {
      const registryData = AppRegistry[app.name];
      if (registryData?.desktops) {
        // Каждый desktop из расширения становится отдельным workspace
        for (const desktop of registryData.desktops) {
          workspaces.push(
            new DesktopWorkspaceDomainEntity({
              name: desktop.name,
              title: desktop.title,
              extension_name: app.name,
              icon: desktop.icon,
              defaultRoute: desktop.defaultRoute,
            })
          );
        }
      }
    }

    const layout = 'default';
    const authorizedHome = 'profile';
    const nonAuthorizedHome = 'signup';
    return new DesktopDomainEntity({
      coopname: config.coopname,
      layout,
      workspaces,
      authorizedHome,
      nonAuthorizedHome,
    });
  }
}
