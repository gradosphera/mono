import type { DesktopWorkspaceDomainInterface } from './desktop-workspace-domain.interface';

export interface DesktopDomainInterface {
  coopname: string;
  layout: string;
  authorizedHome: string;
  nonAuthorizedHome: string;
  workspaces: DesktopWorkspaceDomainInterface[];
}
