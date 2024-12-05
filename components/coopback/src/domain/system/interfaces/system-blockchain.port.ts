import type { RegistratorContract } from 'cooptypes';
import type { SystemAccountInterface } from '~/types/shared';
import type { GetInfoResult } from '~/types/shared/blockchain.types';

export interface SystemBlockchainPort {
  getInfo(coopname: string): Promise<GetInfoResult>;
  getSystemAccount(username: string): Promise<SystemAccountInterface | null>;
  getCooperatorAccount(coopname: string): Promise<RegistratorContract.Tables.Cooperatives.ICooperative | null>;
  getBaseUserAccount(coopname: string): Promise<RegistratorContract.Tables.Accounts.IAccount | null>;
}

export const SYSTEM_BLOCKCHAIN_PORT = Symbol('SystemBlockchainPort');
