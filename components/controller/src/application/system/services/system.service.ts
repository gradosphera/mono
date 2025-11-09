import { Injectable } from '@nestjs/common';
import { SystemInfoDTO } from '../dto/system.dto';
import { SystemDomainInteractor } from '~/domain/system/interactors/system.interactor';
import { ProviderService } from '~/application/provider/services/provider.service';
import type { InstallDTO } from '../dto/install.dto';
import type { InitDTO } from '../dto/init.dto';
import type { SetWifInputDTO } from '../dto/set-wif-input.dto';
import type { UpdateDTO } from '../dto/update.dto';
import type { StartInstallInputDTO } from '../dto/start-install-input.dto';
import { StartInstallResultDTO } from '../dto/start-install-result.dto';
import type { GetInstallationStatusInputDTO } from '../dto/installation-status.dto';
import { InstallationStatusDTO } from '../dto/installation-status.dto';
import { OrganizationWithBankAccountDTO } from '~/application/common/dto/organization.dto';
import { OrganizationDomainEntity } from '~/domain/branch/entities/organization-domain.entity';
import config from '~/config/config';
import { SettingsDTO, UpdateSettingsInputDTO } from '../dto/settings.dto';

@Injectable()
export class SystemService {
  constructor(
    private readonly systemDomainInteractor: SystemDomainInteractor,
    private readonly providerService: ProviderService
  ) {}

  public async getInfo(): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.getInfo();

    return new SystemInfoDTO(info, this.providerService.isProviderAvailable());
  }

  public async startInstall(data: StartInstallInputDTO): Promise<StartInstallResultDTO> {
    const result = await this.systemDomainInteractor.startInstall(data);

    return new StartInstallResultDTO({
      install_code: result.install_code,
      coopname: result.coopname,
    });
  }

  public async getInstallationStatus(data: GetInstallationStatusInputDTO): Promise<InstallationStatusDTO> {
    const result = await this.systemDomainInteractor.getInstallationStatus(data);

    // Если есть данные организации (из репозитория), возвращаем их с банковскими данными
    let organizationData: OrganizationWithBankAccountDTO | null = null;
    if (result.organization_data) {
      // Получаем дефолтный payment method для кооператива
      const defaultPaymentMethod = await this.systemDomainInteractor.getDefaultPaymentMethod(config.coopname);

      // Создаем DTO организации с банковскими данными
      organizationData = new OrganizationWithBankAccountDTO({
        ...result.organization_data,
        bank_account: defaultPaymentMethod?.data || null,
      });
    }

    return new InstallationStatusDTO({
      has_private_account: result.has_private_account,
      organization_data: organizationData,
      init_by_server: result.init_by_server,
    });
  }

  public async install(data: InstallDTO): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.install({
      ...data,
      vars: data.vars as any, // SetVarsInputDTO совместим с VarsDomainInterface по полям
    });
    return new SystemInfoDTO(info, this.providerService.isProviderAvailable());
  }

  public async update(data: UpdateDTO): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.update({
      ...data,
      organization_data: data.organization_data
        ? new OrganizationDomainEntity({ ...data.organization_data, username: config.coopname })
        : undefined, // Не передаем поле, если оно отсутствует
    });
    return new SystemInfoDTO(info, this.providerService.isProviderAvailable());
  }

  public async init(data: InitDTO): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.init(data);
    return new SystemInfoDTO(info, this.providerService.isProviderAvailable());
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
