import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { SovietContract } from 'cooptypes';
import { TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import type { DecisionBlockchainPort } from '~/domain/decision/interfaces/decision-blockchain.port';

@Injectable()
export class DecisionBlockchainAdapter implements DecisionBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}

  async getProjects(coopname: string): Promise<SovietContract.Tables.Decisions.IDecision[]> {
    return this.blockchainService.getAllRows(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Decisions.tableName
    );
  }

  async getProject(coopname: string, decision_id: string): Promise<SovietContract.Tables.Decisions.IDecision | null> {
    return this.blockchainService.getSingleRow(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Decisions.tableName,
      decision_id
    );
  }

  async publichProjectOfFreeDecision(
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
}
