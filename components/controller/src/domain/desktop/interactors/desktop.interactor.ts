import { Injectable } from '@nestjs/common';
import config from '~/config/config';
import { ExtensionDomainListingInteractor } from '~/domain/extension/interactors/extension-listing-domain.interactor';
import { DesktopDomainEntity } from '../entities/desktop-domain.entity';
import { DesktopWorkspaceDomainEntity } from '../entities/workspace-domain.entity';

@Injectable()
export class DesktopDomainInteractor {
  constructor(private readonly extensionDomainListingInteractor: ExtensionDomainListingInteractor) {}

  async getDesktop(): Promise<DesktopDomainEntity> {
    const apps = await this.extensionDomainListingInteractor.getCombinedAppList({
      is_installed: true,
      is_desktop: true,
      is_available: true,
      enabled: true,
    });
    const workspaces = apps.map((workspace) => new DesktopWorkspaceDomainEntity(workspace));
    const layout = 'default';
    const authorizedHome = 'profile';
    const nonAuthorizedHome = 'signup';
    return new DesktopDomainEntity({ coopname: config.coopname, layout, workspaces, authorizedHome, nonAuthorizedHome });
  }
}
