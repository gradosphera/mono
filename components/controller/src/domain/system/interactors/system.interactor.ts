import { Inject, Injectable } from '@nestjs/common';
import { SYSTEM_BLOCKCHAIN_PORT, SystemBlockchainPort } from '../interfaces/system-blockchain.port';
import { SystemInfoDomainEntity } from '../entities/systeminfo-domain.entity';
import config from '~/config/config';
import { systemService } from '~/services';
import type { RegistratorContract } from 'cooptypes';
import type { BlockchainAccountInterface } from '~/types/shared';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { SystemDomainService } from '../services/system-domain.service';
import type { InstallInputDomainInterface } from '../interfaces/install-input-domain.interface';
import type { InitInputDomainInterface } from '../interfaces/init-input-domain.interface';
import type { SetWifInputDomainInterface } from '../interfaces/set-wif-input-domain.interface';
import { VARS_REPOSITORY, VarsRepository } from '~/domain/common/repositories/vars.repository';
import type { UpdateInputDomainInterface } from '../interfaces/update-input-domain.interface';
import { ORGANIZATION_REPOSITORY, type OrganizationRepository } from '~/domain/common/repositories/organization.repository';
import { OrganizationDomainEntity } from '~/domain/branch/entities/organization-domain.entity';

@Injectable()
export class SystemDomainInteractor {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    @Inject(SYSTEM_BLOCKCHAIN_PORT) private readonly systemBlockchainPort: SystemBlockchainPort,
    private readonly systemDomainService: SystemDomainService,
    @Inject(VARS_REPOSITORY) private readonly varsRepository: VarsRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepository: OrganizationRepository
  ) {}

  async setWif(data: SetWifInputDomainInterface): Promise<void> {
    await systemService.setWif(data);
  }

  async init(data: InitInputDomainInterface): Promise<SystemInfoDomainEntity> {
    await systemService.init(data);
    return this.getInfo();
  }

  async install(data: InstallInputDomainInterface): Promise<SystemInfoDomainEntity> {
    await systemService.install(data);
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

    const system_status = await systemService.getMonoStatus();

    let contacts;

    try {
      contacts = await this.systemDomainService.loadContacts();
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const vars = await this.varsRepository.get();

    return new SystemInfoDomainEntity({
      blockchain_info,
      contacts,
      vars,
      coopname: config.coopname,
      cooperator_account,
      user_account,
      blockchain_account,
      system_status,
    });
  }
}
