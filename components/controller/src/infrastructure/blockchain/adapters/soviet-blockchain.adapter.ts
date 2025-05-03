import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { SovietContract } from 'cooptypes';
import { TransactResult, UInt64 } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import type { SovietBlockchainPort } from '~/domain/common/ports/soviet-blockchain.port';

@Injectable()
export class SovietBlockchainAdapter implements SovietBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}

  async getDecisions(coopname: string): Promise<SovietContract.Tables.Decisions.IDecision[]> {
    return this.blockchainService.getAllRows(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Decisions.tableName
    );
  }

  async getDecision(coopname: string, decision_id: string): Promise<SovietContract.Tables.Decisions.IDecision | null> {
    return this.blockchainService.getSingleRow(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Decisions.tableName,
      UInt64.from(decision_id)
    );
  }

  async publishProjectOfFreeDecision(
    data: SovietContract.Actions.Decisions.CreateFreeDecision.ICreateFreeDecision
  ): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Decisions.CreateFreeDecision.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  async cancelExpiredDecision(data: SovietContract.Actions.Decisions.Cancelexprd.ICancelExpired): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Decisions.Cancelexprd.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }
}
