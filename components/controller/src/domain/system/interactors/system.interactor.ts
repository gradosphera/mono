import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { SYSTEM_BLOCKCHAIN_PORT, SystemBlockchainPort } from '../interfaces/system-blockchain.port';
import { SystemInfoDomainEntity } from '../entities/systeminfo-domain.entity';
import config from '~/config/config';
import type { RegistratorContract } from 'cooptypes';
import type { BlockchainAccountInterface } from '~/types/shared';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from '~/domain/account/services/account-domain.service';
import { SystemDomainService } from '../services/system-domain.service';
import type { InstallInputDomainInterface } from '../interfaces/install-input-domain.interface';
import type { InitInputDomainInterface } from '../interfaces/init-input-domain.interface';
import type { SetWifInputDomainInterface } from '../interfaces/set-wif-input-domain.interface';
import { VARS_REPOSITORY, VarsRepository } from '~/domain/common/repositories/vars.repository';
import type { UpdateInputDomainInterface } from '../interfaces/update-input-domain.interface';
import { ORGANIZATION_REPOSITORY, type OrganizationRepository } from '~/domain/common/repositories/organization.repository';
import { SymbolsDTO } from '~/application/system/dto/symbols.dto';
import { SettingsDomainInteractor } from '~/domain/settings/interactors/settings.interactor';
import type { UpdateSettingsInputDomainInterface } from '~/domain/settings/interfaces/update-settings-input-domain.interface';
import type { SettingsDomainEntity } from '~/domain/settings/entities/settings-domain.entity';
import { InstallDomainService } from '../services/install-domain.service';
import { InitDomainService } from '../services/init-domain.service';
import { WifDomainService } from '../services/wif-domain.service';
import { MONO_STATUS_REPOSITORY, MonoStatusRepository } from '~/domain/common/repositories/mono-status.repository';

@Injectable()
export class SystemDomainInteractor {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    @Inject(SYSTEM_BLOCKCHAIN_PORT) private readonly systemBlockchainPort: SystemBlockchainPort,
    private readonly systemDomainService: SystemDomainService,
    @Inject(VARS_REPOSITORY) private readonly varsRepository: VarsRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepository: OrganizationRepository,
    private readonly settingsDomainInteractor: SettingsDomainInteractor,
    private readonly installDomainService: InstallDomainService,
    private readonly initDomainService: InitDomainService,
    private readonly wifDomainService: WifDomainService,
    @Inject(MONO_STATUS_REPOSITORY) private readonly monoStatusRepository: MonoStatusRepository
  ) {}

  async setWif(data: SetWifInputDomainInterface): Promise<void> {
    await this.wifDomainService.setWif(data);
  }

  async init(data: InitInputDomainInterface): Promise<SystemInfoDomainEntity> {
    await this.initDomainService.init(data);
    return this.getInfo();
  }

  async install(data: InstallInputDomainInterface): Promise<SystemInfoDomainEntity> {
    await this.installDomainService.install(data);
    return this.getInfo();
  }

  async update(data: UpdateInputDomainInterface): Promise<SystemInfoDomainEntity> {
    if (data.vars) await this.varsRepository.create(data.vars);
    if (data.organization_data) await this.organizationRepository.create(data.organization_data);

    return this.getInfo();
  }

  async getInfo(): Promise<SystemInfoDomainEntity> {
    const blockchain_info = await this.systemBlockchainPort.getInfo(config.coopname);

    const cooperator_account = (await this.accountDomainService.getCooperatorAccount(
      config.coopname
    )) as RegistratorContract.Tables.Cooperatives.ICooperative;

    const user_account = (await this.accountDomainService.getUserAccount(
      config.coopname
    )) as RegistratorContract.Tables.Accounts.IAccount;

    const blockchain_account = (await this.accountDomainService.getBlockchainAccount(
      config.coopname
    )) as BlockchainAccountInterface;

    const system_status = await this.monoStatusRepository.getStatus();

    let contacts;

    try {
      contacts = await this.systemDomainService.loadContacts();
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const vars = await this.varsRepository.get();

    const symbols = new SymbolsDTO(
      config.blockchain.root_symbol,
      config.blockchain.root_govern_symbol,
      config.blockchain.root_precision,
      config.blockchain.root_govern_precision
    );

    // Получаем настройки системы
    const settings = await this.getSettings();

    return new SystemInfoDomainEntity({
      blockchain_info,
      contacts,
      vars,
      coopname: config.coopname,
      cooperator_account,
      user_account,
      blockchain_account,
      system_status,
      symbols,
      settings,
    });
  }

  /**
   * Получает настройки системы
   */
  async getSettings(): Promise<SettingsDomainEntity> {
    return this.settingsDomainInteractor.getSettings();
  }

  /**
   * Обновляет настройки системы
   * @param updates - объект с полями для обновления
   */
  async updateSettings(updates: UpdateSettingsInputDomainInterface): Promise<SettingsDomainEntity> {
    return this.settingsDomainInteractor.updateSettings(updates);
  }
}
