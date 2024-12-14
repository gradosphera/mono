import { Inject, Injectable } from '@nestjs/common';
import type { BlockchainAccountInterface } from '~/types/shared';
import { ACCOUNT_BLOCKCHAIN_PORT, type AccountBlockchainPort } from '../interfaces/account-blockchain.port';
import type { RegistratorContract, SovietContract } from 'cooptypes';

@Injectable()
export class AccountDomainService {
  constructor(@Inject(ACCOUNT_BLOCKCHAIN_PORT) private readonly accountBlockchainPort: AccountBlockchainPort) {}

  async getBlockchainAccount(username: string): Promise<BlockchainAccountInterface | null> {
    return await this.accountBlockchainPort.getBlockchainAccount(username);
  }

  async getCooperatorAccount(username: string): Promise<RegistratorContract.Tables.Cooperatives.ICooperative | null> {
    return await this.accountBlockchainPort.getCooperatorAccount(username);
  }

  async getParticipantAccount(
    coopname: string,
    username: string
  ): Promise<SovietContract.Tables.Participants.IParticipants | null> {
    return await this.accountBlockchainPort.getParticipantAccount(coopname, username);
  }

  async getUserAccount(username: string): Promise<RegistratorContract.Tables.Accounts.IAccount | null> {
    return await this.accountBlockchainPort.getUserAccount(username);
  }
}
