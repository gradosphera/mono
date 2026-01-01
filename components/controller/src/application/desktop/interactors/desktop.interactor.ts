import { Injectable } from '@nestjs/common';
import config from '~/config/config';
import { ExtensionListingInteractor } from '~/application/appstore/interactors/extension-listing.interactor';
import { DesktopDomainEntity } from '~/domain/desktop/entities/desktop-domain.entity';
import { DesktopWorkspaceDomainEntity } from '~/domain/desktop/entities/workspace-domain.entity';
import { AppRegistry } from '~/extensions/extensions.registry';

@Injectable()
export class DesktopDomainInteractor {
  constructor(private readonly extensionListingInteractor: ExtensionListingInteractor) {}

  async getDesktop(): Promise<DesktopDomainEntity> {
    // Получаем установленные desktop расширения
    const apps = await this.extensionListingInteractor.getCombinedAppList({
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

    return new DesktopDomainEntity({
      coopname: config.coopname,
      layout,
      workspaces,
    });
  }
}
