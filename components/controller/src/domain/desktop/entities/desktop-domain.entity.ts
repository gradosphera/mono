import type { DesktopDomainInterface } from '../interfaces/desktop-domain.interface';
import type { DesktopWorkspaceDomainEntity } from './workspace-domain.entity';

/**
 * Доменная сущность Desktop
 * Содержит информацию о доступных рабочих столах (workspaces)
 * Настройки по умолчанию (authorized/nonAuthorizedHome) перенесены в Settings
 */
export class DesktopDomainEntity implements DesktopDomainInterface {
  public readonly coopname!: string;
  public readonly layout!: string;
  public readonly workspaces!: DesktopWorkspaceDomainEntity[];

  constructor(data: DesktopDomainEntity) {
    this.coopname = data.coopname;
    this.layout = data.layout;
    this.workspaces = data.workspaces;
  }
}
