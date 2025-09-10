import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { CreateProjectInvestDomainInput } from '../actions/create-project-invest-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';

/**
 * Интерактор домена для управления инвестициями CAPITAL контракта
 * Обрабатывает действия связанные с инвестициями в проекты
 */
@Injectable()
export class InvestsManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Инвестирование в проект CAPITAL контракта
   */
  async createProjectInvest(data: CreateProjectInvestDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.CreateProjectInvest.ICreateInvest = {
      coopname: data.coopname,
      project_hash: data.project_hash,
      username: data.username,
      invest_hash: data.invest_hash,
      amount: data.amount,
      statement: data.statement,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createProjectInvest(blockchainData);
  }
}
