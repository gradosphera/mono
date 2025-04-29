import type { DesktopDomainInterface } from '../interfaces/desktop-domain.interface';
import type { DesktopWorkspaceDomainEntity } from './workspace-domain.entity';

export class DesktopDomainEntity implements DesktopDomainInterface {
  public readonly coopname!: string;
  public readonly layout!: string;
  public readonly authorizedHome!: string;
  public readonly nonAuthorizedHome!: string;

  public readonly workspaces!: DesktopWorkspaceDomainEntity[];

  constructor(data: DesktopDomainEntity) {
    this.coopname = data.coopname;
    this.layout = data.layout;
    this.authorizedHome = data.authorizedHome;
    this.nonAuthorizedHome = data.nonAuthorizedHome;
    this.workspaces = data.workspaces;
  }
}
