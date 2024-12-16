import { Injectable } from '@nestjs/common';
import { BranchBlockchainPort } from '~/domain/branch/interfaces/branch-blockchain.port';
import { BlockchainService } from '../blockchain.service';
import { BranchContract, SovietContract } from 'cooptypes';
import { TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';

@Injectable()
export class BranchBlockchainAdapter implements BranchBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}

  async getBranches(coopname: string): Promise<BranchContract.Tables.Branches.IBranch[]> {
    return this.blockchainService.getAllRows(
      BranchContract.contractName.production,
      coopname,
      BranchContract.Tables.Branches.tableName
    );
  }
  async getBranch(coopname: string, braname: string): Promise<BranchContract.Tables.Branches.IBranch | null> {
    return this.blockchainService.getSingleRow(
      BranchContract.contractName.production,
      coopname,
      BranchContract.Tables.Branches.tableName,
      braname
    );
  }

  async createBranch(data: BranchContract.Actions.CreateBranch.ICreateBranch): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);

    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact([
      {
        account: BranchContract.contractName.production,
        name: BranchContract.Actions.CreateBranch.actionName,
        authorization: [{ actor: data.coopname, permission: 'active' }],
        data,
      },
    ]);
  }

  async editBranch(data: BranchContract.Actions.EditBranch.IEditBranch): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact({
      account: BranchContract.contractName.production,
      name: BranchContract.Actions.EditBranch.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  async deleteBranch(data: BranchContract.Actions.DeleteBranch.IDeleteBranch): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact({
      account: BranchContract.contractName.production,
      name: BranchContract.Actions.DeleteBranch.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  async addTrustedAccount(data: BranchContract.Actions.AddTrusted.IAddTrusted): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact({
      account: BranchContract.contractName.production,
      name: BranchContract.Actions.AddTrusted.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  async deleteTrustedAccount(data: BranchContract.Actions.DeleteTrusted.IDeleteTrusted): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact({
      account: BranchContract.contractName.production,
      name: BranchContract.Actions.DeleteTrusted.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  async selectBranch(data: SovietContract.Actions.Branches.SelectBranch.ISelectBranch): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    console.log('data: ', data);
    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Branches.SelectBranch.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }
}
