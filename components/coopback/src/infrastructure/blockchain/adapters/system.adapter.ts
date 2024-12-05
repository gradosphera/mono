import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import type { SystemBlockchainPort } from '~/domain/system/interfaces/system-blockchain.port';
import { RegistratorContract } from 'cooptypes';
import type { GetInfoResult } from '~/types/shared/blockchain.types';
import type { API } from '@wharfkit/antelope';
import type { SystemAccountInterface } from '~/types/shared';

@Injectable()
export class SystemBlockchainAdapter implements SystemBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getInfo(coopname: string): Promise<GetInfoResult> {
    return this.blockchainService.getInfo();
  }

  getSystemAccount(username: string): Promise<SystemAccountInterface> {
    return this.blockchainService.getAccount(username);
  }

  getBaseUserAccount(username: string): Promise<RegistratorContract.Tables.Accounts.IAccount | null> {
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
