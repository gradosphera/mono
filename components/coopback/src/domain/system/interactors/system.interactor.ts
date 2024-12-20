import { Inject, Injectable } from '@nestjs/common';
import { SYSTEM_BLOCKCHAIN_PORT, SystemBlockchainPort } from '../interfaces/system-blockchain.port';
import { SystemInfoDomainEntity } from '../entities/systeminfo-domain.entity';
import config from '~/config/config';
import { systemService } from '~/services';
import type { RegistratorContract } from 'cooptypes';
import type { BlockchainAccountInterface } from '~/types/shared';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';

@Injectable()
export class SystemDomainInteractor {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    @Inject(SYSTEM_BLOCKCHAIN_PORT) private readonly systemBlockchainPort: SystemBlockchainPort
  ) {}

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

    return new SystemInfoDomainEntity({
      blockchain_info,
      coopname: config.coopname,
      cooperator_account,
      user_account,
      blockchain_account,
      system_status,
    });
  }
}
