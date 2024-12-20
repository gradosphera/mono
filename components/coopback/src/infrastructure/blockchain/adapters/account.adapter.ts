import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { RegistratorContract, SovietContract } from 'cooptypes';
import type { BlockchainAccountInterface } from '~/types/shared';
import type { AccountBlockchainPort } from '~/domain/account/interfaces/account-blockchain.port';

@Injectable()
export class AccountBlockchainAdapter implements AccountBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}

  getBlockchainAccount(username: string): Promise<BlockchainAccountInterface | null> {
    return this.blockchainService.getAccount(username);
  }

  getParticipantAccount(
    coopname: string,
    username: string
  ): Promise<SovietContract.Tables.Participants.IParticipants | null> {
    return this.blockchainService.getSingleRow(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Participants.tableName,
      username
    );
  }
  getUserAccount(username: string): Promise<RegistratorContract.Tables.Accounts.IAccount | null> {
    return this.blockchainService.getSingleRow(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Accounts.tableName,
      username
    );
  }

  getCooperatorAccount(coopname: string): Promise<RegistratorContract.Tables.Cooperatives.ICooperative | null> {
    return this.blockchainService.getSingleRow(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Cooperatives.tableName,
      coopname
    );
  }
}
