import type { BlockchainInfoInterface } from '~/types/shared';
import type { SystemInfoDomainInterface } from '../interfaces/info-domain.interface';

export class SystemInfoDomainEntity implements SystemInfoDomainInterface {
  public readonly coopname: string;
  public readonly blockchain: BlockchainInfoInterface;

  constructor(coopname: string, blockchain_info: BlockchainInfoInterface) {
    this.coopname = coopname;
    this.blockchain = blockchain_info;
  }
}
