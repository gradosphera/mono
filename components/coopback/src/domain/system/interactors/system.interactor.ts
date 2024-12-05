import { Inject, Injectable } from '@nestjs/common';
import { SYSTEM_BLOCKCHAIN_PORT, SystemBlockchainPort } from '../interfaces/system-blockchain.port';
import { SystemInfoDomainEntity } from '../entities/systeminfo-domain.entity';
import config from '~/config/config';
import { systemService } from '~/services';
import type { RegistratorContract } from 'cooptypes';
import type { SystemAccountInterface } from '~/types/shared';

@Injectable()
export class SystemDomainInteractor {
  constructor(@Inject(SYSTEM_BLOCKCHAIN_PORT) private readonly systemBlockchainPort: SystemBlockchainPort) {}

  async getInfo(): Promise<SystemInfoDomainEntity> {
    const blockchain_info = await this.systemBlockchainPort.getInfo(config.coopname);

    const cooperator_account = (await this.systemBlockchainPort.getCooperatorAccount(
      config.coopname
    )) as RegistratorContract.Tables.Cooperatives.ICooperative;
    const user_account = (await this.systemBlockchainPort.getBaseUserAccount(
      config.coopname
    )) as RegistratorContract.Tables.Accounts.IAccount;

    const system_account = (await this.systemBlockchainPort.getSystemAccount(config.coopname)) as SystemAccountInterface;

    const system_status = await systemService.getMonoStatus();

    return new SystemInfoDomainEntity({
      blockchain_info,
      coopname: config.coopname,
      cooperator_account,
      user_account,
      system_account,
      system_status,
    });
  }
}
