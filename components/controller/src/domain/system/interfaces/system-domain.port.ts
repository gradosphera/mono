import type { SystemInfoDomainEntity } from '../entities/systeminfo-domain.entity';
import type { InstallInputDomainInterface } from './install-input-domain.interface';
import type { InitInputDomainInterface } from './init-input-domain.interface';
import type { SetWifInputDomainInterface } from './set-wif-input-domain.interface';
import type {
  StartInstallInputDomainInterface,
  StartInstallResultDomainInterface,
} from './start-install-input-domain.interface';
import type {
  GetInstallationStatusInputDomainInterface,
  InstallationStatusDomainInterface,
} from './installation-status-domain.interface';
import type { UpdateInputDomainInterface } from './update-input-domain.interface';
import type { UpdateSettingsInputDomainInterface } from '~/domain/settings/interfaces/update-settings-input-domain.interface';
import type { SettingsDomainEntity } from '~/domain/settings/entities/settings-domain.entity';

export const SYSTEM_DOMAIN_PORT = Symbol('SYSTEM_DOMAIN_PORT');

export interface SystemDomainPort {
  startInstall(data: StartInstallInputDomainInterface): Promise<StartInstallResultDomainInterface>;
  getInstallationStatus(data: GetInstallationStatusInputDomainInterface): Promise<InstallationStatusDomainInterface>;
  getDefaultPaymentMethod(username: string): Promise<any>;
  setWif(data: SetWifInputDomainInterface): Promise<void>;
  init(data: InitInputDomainInterface): Promise<SystemInfoDomainEntity>;
  install(data: InstallInputDomainInterface): Promise<SystemInfoDomainEntity>;
  update(data: UpdateInputDomainInterface): Promise<SystemInfoDomainEntity>;
  getInfo(): Promise<SystemInfoDomainEntity>;
  getSettings(): Promise<SettingsDomainEntity>;
  updateSettings(updates: UpdateSettingsInputDomainInterface): Promise<SettingsDomainEntity>;
}
