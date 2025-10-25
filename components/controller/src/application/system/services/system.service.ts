import { Injectable } from '@nestjs/common';
import { SystemInfoDTO } from '../dto/system.dto';
import { SystemDomainInteractor } from '~/domain/system/interactors/system.interactor';
import type { InstallDTO } from '../dto/install.dto';
import type { InitDTO } from '../dto/init.dto';
import type { SetWifInputDTO } from '../dto/set-wif-input.dto';
import type { UpdateDTO } from '../dto/update.dto';
import { OrganizationDomainEntity } from '~/domain/branch/entities/organization-domain.entity';
import config from '~/config/config';
import { SettingsDTO, UpdateSettingsInputDTO } from '../dto/settings.dto';

@Injectable()
export class SystemService {
  constructor(private readonly systemDomainInteractor: SystemDomainInteractor) {}

  public async getInfo(): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.getInfo();

    return new SystemInfoDTO(info);
  }

  public async install(data: InstallDTO): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.install(data);
    return new SystemInfoDTO(info);
  }

  public async update(data: UpdateDTO): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.update({
      ...data,
      organization_data: data.organization_data
        ? new OrganizationDomainEntity({ ...data.organization_data, username: config.coopname })
        : undefined, // Не передаем поле, если оно отсутствует
    });
    return new SystemInfoDTO(info);
  }

  public async init(data: InitDTO): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.init(data);
    return new SystemInfoDTO(info);
  }

  public async setWif(data: SetWifInputDTO): Promise<void> {
    await this.systemDomainInteractor.setWif(data);
  }

  /**
   * Обновляет настройки системы
   */
  public async updateSettings(data: UpdateSettingsInputDTO): Promise<SettingsDTO> {
    const settings = await this.systemDomainInteractor.updateSettings(data);
    return new SettingsDTO(settings);
  }
}
