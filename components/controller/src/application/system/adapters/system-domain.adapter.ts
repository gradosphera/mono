import { Injectable } from '@nestjs/common';
import type { SystemDomainPort } from '~/domain/system/interfaces/system-domain.port';
import type { SystemInfoDomainEntity } from '~/domain/system/entities/systeminfo-domain.entity';
import type { InstallInputDomainInterface } from '~/domain/system/interfaces/install-input-domain.interface';
import type { InitInputDomainInterface } from '~/domain/system/interfaces/init-input-domain.interface';
import type { SetWifInputDomainInterface } from '~/domain/system/interfaces/set-wif-input-domain.interface';
import type {
  StartInstallInputDomainInterface,
  StartInstallResultDomainInterface,
} from '~/domain/system/interfaces/start-install-input-domain.interface';
import type {
  GetInstallationStatusInputDomainInterface,
  InstallationStatusDomainInterface,
} from '~/domain/system/interfaces/installation-status-domain.interface';
import type { UpdateInputDomainInterface } from '~/domain/system/interfaces/update-input-domain.interface';
import type { UpdateSettingsInputDomainInterface } from '~/domain/settings/interfaces/update-settings-input-domain.interface';
import type { SettingsDomainEntity } from '~/domain/settings/entities/settings-domain.entity';
import { SystemInteractor } from '../interactors/system.interactor';

@Injectable()
export class SystemDomainAdapter implements SystemDomainPort {
  constructor(private readonly systemInteractor: SystemInteractor) {}

  async startInstall(data: StartInstallInputDomainInterface): Promise<StartInstallResultDomainInterface> {
    return this.systemInteractor.startInstall(data);
  }

  async getInstallationStatus(data: GetInstallationStatusInputDomainInterface): Promise<InstallationStatusDomainInterface> {
    return this.systemInteractor.getInstallationStatus(data);
  }

  async getDefaultPaymentMethod(username: string): Promise<any> {
    return this.systemInteractor.getDefaultPaymentMethod(username);
  }

  async setWif(data: SetWifInputDomainInterface): Promise<void> {
    return this.systemInteractor.setWif(data);
  }

  async init(data: InitInputDomainInterface): Promise<SystemInfoDomainEntity> {
    return this.systemInteractor.init(data);
  }

  async install(data: InstallInputDomainInterface): Promise<SystemInfoDomainEntity> {
    return this.systemInteractor.install(data);
  }

  async update(data: UpdateInputDomainInterface): Promise<SystemInfoDomainEntity> {
    return this.systemInteractor.update(data);
  }

  async getInfo(): Promise<SystemInfoDomainEntity> {
    return this.systemInteractor.getInfo();
  }

  async getSettings(): Promise<SettingsDomainEntity> {
    return this.systemInteractor.getSettings();
  }

  async updateSettings(updates: UpdateSettingsInputDomainInterface): Promise<SettingsDomainEntity> {
    return this.systemInteractor.updateSettings(updates);
  }
}
