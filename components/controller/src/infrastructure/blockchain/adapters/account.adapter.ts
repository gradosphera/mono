import { BadGatewayException, Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { RegistratorContract, SovietContract } from 'cooptypes';
import type { BlockchainAccountInterface } from '~/types/shared';
import type { AccountBlockchainPort } from '~/domain/account/interfaces/account-blockchain.port';
import Vault from '~/models/vault.model';
import { Name } from '@wharfkit/antelope';

@Injectable()
export class AccountBlockchainAdapter implements AccountBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}

  async addParticipantAccount(data: RegistratorContract.Actions.AddUser.IAddUser): Promise<void> {
    const wif = await Vault.getWif(data.coopname);

    if (!wif) throw new BadGatewayException('Не найден приватный ключ для совершения операции');

    await this.blockchainService.initialize(data.coopname, wif);

    await this.blockchainService.transact({
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.AddUser.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }
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
      Name.from(username)
    );
  }
  getUserAccount(username: string): Promise<RegistratorContract.Tables.Accounts.IAccount | null> {
    return this.blockchainService.getSingleRow(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Accounts.tableName,
      Name.from(username)
    );
  }

  getCooperatorAccount(coopname: string): Promise<RegistratorContract.Tables.Cooperatives.ICooperative | null> {
    return this.blockchainService.getSingleRow(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Cooperatives.tableName,
      Name.from(coopname)
    );
  }
}
