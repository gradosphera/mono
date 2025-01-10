import { RegistratorContract } from 'cooptypes';
import type { SystemStatusInterface } from '~/types';
import type { BlockchainAccountInterface } from '~/types/shared';
import type { GetInfoResult } from '~/types/shared/blockchain.types';
import { CooperativeContactsDomainInterface } from '../interfaces/cooperative-contacts-domain.interface';
import type { VarsDomainInterface } from '../interfaces/vars-domain.interface';

export class SystemInfoDomainEntity {
  public readonly coopname!: string;
  public readonly blockchain_info!: GetInfoResult;
  public readonly cooperator_account!: RegistratorContract.Tables.Cooperatives.ICooperative;
  public readonly user_account!: RegistratorContract.Tables.Accounts.IAccount;
  public readonly blockchain_account!: BlockchainAccountInterface;
  public readonly system_status!: SystemStatusInterface;
  public readonly contacts!: CooperativeContactsDomainInterface;
  public readonly vars!: VarsDomainInterface | null;

  constructor(data: SystemInfoDomainEntity) {
    Object.assign(this, data);
  }
}
