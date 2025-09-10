import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { CreateDebtDomainInput } from '../actions/create-debt-domain-input.interface';

/**
 * Интерактор домена для управления долгами CAPITAL контракта
 * Обрабатывает действия связанные с созданием и управлением долгами
 */
@Injectable()
export class DebtManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Создание долга в CAPITAL контракте
   */
  async createDebt(data: CreateDebtDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.CreateDebt.ICreateDebt = {
      coopname: data.coopname,
      username: data.username,
      debt_hash: data.debt_hash,
      project_hash: data.project_hash,
      amount: data.amount,
      repaid_at: data.repaid_at,
      statement: data.statement,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createDebt(blockchainData);
  }
}
