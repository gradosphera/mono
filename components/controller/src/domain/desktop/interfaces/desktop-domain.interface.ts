import type { DesktopWorkspaceDomainInterface } from './desktop-workspace-domain.interface';

/**
 * Доменный интерфейс Desktop
 * Настройки по умолчанию (authorized/nonAuthorizedHome) перенесены в Settings
 */
export interface DesktopDomainInterface {
  coopname: string;
  layout: string;
  workspaces: DesktopWorkspaceDomainInterface[];
  authorizedHome?: string;
  nonAuthorizedHome?: string;
}
