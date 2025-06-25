import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { GatewayContract } from 'cooptypes';
import { TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type {
  GatewayBlockchainPort,
  CompleteOutcomeDomainInterface,
  DeclineOutcomeDomainInterface,
} from '~/domain/gateway/ports/gateway-blockchain.port';

/**
 * Блокчейн адаптер для gateway
 * Реализует только управление уже созданными outcomes
 */
@Injectable()
export class GatewayBlockchainAdapter implements GatewayBlockchainPort {
  private readonly logger = new Logger(GatewayBlockchainAdapter.name);

  constructor(private readonly blockchainService: BlockchainService) {}

  /**
   * Завершение исходящего платежа
   */
  async completeOutcome(data: CompleteOutcomeDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменные данные в формат cooptypes контракта
    const blockchainData: GatewayContract.Actions.CompleteOutcome.ICompleteOutcome = {
      coopname: data.coopname,
      outcome_hash: data.outcome_hash,
    };

    const result = (await this.blockchainService.transact({
      account: GatewayContract.contractName.production,
      name: GatewayContract.Actions.CompleteOutcome.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    this.logger.log(`Завершен исходящий платеж: ${data.outcome_hash}`);
    return result;
  }

  /**
   * Отклонение исходящего платежа
   */
  async declineOutcome(data: DeclineOutcomeDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменные данные в формат cooptypes контракта
    const blockchainData: GatewayContract.Actions.DeclineOutcome.IOutDecline = {
      coopname: data.coopname,
      outcome_hash: data.outcome_hash,
      reason: data.reason,
    };

    const result = (await this.blockchainService.transact({
      account: GatewayContract.contractName.production,
      name: GatewayContract.Actions.DeclineOutcome.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    this.logger.log(`Отклонен исходящий платеж: ${data.outcome_hash}, причина: ${data.reason}`);
    return result;
  }

  /**
   * Получение исходящих платежей из блокчейна
   */
  async getOutcomes(coopname: string): Promise<GatewayContract.Tables.Outcomes.IOutcome[]> {
    return this.blockchainService.getAllRows(
      GatewayContract.contractName.production,
      coopname,
      GatewayContract.Tables.Outcomes.tableName
    );
  }

  /**
   * Получение конкретного исходящего платежа
   */
  async getOutcome(coopname: string, outcome_hash: string): Promise<GatewayContract.Tables.Outcomes.IOutcome | null> {
    try {
      const outcomes = await this.blockchainService.query(
        GatewayContract.contractName.production,
        coopname,
        GatewayContract.Tables.Outcomes.tableName,
        {
          indexPosition: 'secondary',
          from: outcome_hash,
          to: outcome_hash,
        }
      );

      return outcomes.length > 0 ? outcomes[0] : null;
    } catch (error: any) {
      this.logger.warn(`Не удалось получить outcome ${outcome_hash} для ${coopname}: ${error.message}`);
      return null;
    }
  }
}
