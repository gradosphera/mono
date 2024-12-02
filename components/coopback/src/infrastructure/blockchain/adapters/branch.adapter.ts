import { Injectable } from '@nestjs/common';
import { BranchBlockchainPort } from '~/domain/branch/interfaces/branch-blockchain.port';
import { BlockchainService } from '../blockchain.service';
import { RegistratorContract, SovietContract } from 'cooptypes';
import { TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';

@Injectable()
export class BranchBlockchainAdapter implements BranchBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}
  async enableBranchedMode(data: RegistratorContract.Actions.EnableBranches.IEnableBranches): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);

    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact([
      {
        account: RegistratorContract.contractName.production,
        name: RegistratorContract.Actions.DisableBranches,
        authorization: [{ actor: data.coopname, permission: 'active' }],
        data,
      },
    ]);
  }
  async disableBranchedMode(data: RegistratorContract.Actions.DisableBranches.IDisableBranches): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);

    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact([
      {
        account: RegistratorContract.contractName.production,
        name: RegistratorContract.Actions.EnableBranches.actionName,
        authorization: [{ actor: data.coopname, permission: 'active' }],
        data,
      },
    ]);
  }

  async getBranches(coopname: string): Promise<SovietContract.Tables.Branches.IBranch[]> {
    return this.blockchainService.getAllRows(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Branches.tableName
    );
  }
  async getBranch(coopname: string, braname: string): Promise<SovietContract.Tables.Branches.IBranch | null> {
    return this.blockchainService.getSingleRow(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Branches.tableName,
      braname
    );
  }

  async createBranch(data: SovietContract.Actions.Branches.CreateBranch.ICreateBranch): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);

    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact([
      {
        account: SovietContract.contractName.production,
        name: SovietContract.Actions.Branches.CreateBranch.actionName,
        authorization: [{ actor: data.coopname, permission: 'active' }],
        data,
      },
    ]);
  }

  async editBranch(data: SovietContract.Actions.Branches.EditBranch.IEditBranch): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Branches.EditBranch.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  async deleteBranch(data: SovietContract.Actions.Branches.DeleteBranch.IDeleteBranch): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Branches.DeleteBranch.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  async addTrustedAccount(data: SovietContract.Actions.Branches.AddTrusted.IAddTrusted): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Branches.AddTrusted.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  async deleteTrustedAccount(data: SovietContract.Actions.Branches.DeleteTrusted.IDeleteTrusted): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Branches.DeleteTrusted.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }
}
