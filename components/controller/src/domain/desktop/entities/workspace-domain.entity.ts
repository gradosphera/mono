import type { DesktopWorkspaceDomainInterface } from '../interfaces/desktop-workspace-domain.interface';

export class DesktopWorkspaceDomainEntity implements DesktopWorkspaceDomainInterface {
  public readonly name: string;
  public readonly title: string;

  constructor(data: DesktopWorkspaceDomainInterface) {
    this.name = data.name;
    this.title = data.title;
  }
}
