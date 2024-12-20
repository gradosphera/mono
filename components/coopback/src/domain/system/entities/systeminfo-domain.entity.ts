import { RegistratorContract } from 'cooptypes';
import type { SystemStatusInterface } from '~/types';
import type { BlockchainAccountInterface } from '~/types/shared';
import type { GetInfoResult } from '~/types/shared/blockchain.types';

export class SystemInfoDomainEntity {
  public readonly coopname!: string;
  public readonly blockchain_info!: GetInfoResult;
  public readonly cooperator_account!: RegistratorContract.Tables.Cooperatives.ICooperative;
  public readonly user_account!: RegistratorContract.Tables.Accounts.IAccount;
  public readonly blockchain_account!: BlockchainAccountInterface;
  public readonly system_status!: SystemStatusInterface;

  constructor(data: SystemInfoDomainEntity) {
    Object.assign(this, data);
  }
}
