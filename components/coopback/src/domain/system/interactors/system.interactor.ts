import { Inject, Injectable } from '@nestjs/common';
import { SYSTEM_BLOCKCHAIN_PORT, SystemBlockchainPort } from '../interfaces/system-blockchain.port';
import { SystemInfoDomainEntity } from '../entities/info.entity';
import config from '~/config/config';

@Injectable()
export class SystemDomainInteractor {
  constructor(@Inject(SYSTEM_BLOCKCHAIN_PORT) private readonly systemBlockchainPort: SystemBlockchainPort) {}

  async getInfo(): Promise<SystemInfoDomainEntity> {
    const info = await this.systemBlockchainPort.getInfo(config.coopname);

    return new SystemInfoDomainEntity(config.coopname, info);
  }
}
