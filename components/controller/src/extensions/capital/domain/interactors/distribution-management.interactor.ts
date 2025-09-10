import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { RefreshProjectDomainInput } from '../actions/refresh-project-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';
import type { FundProgramDomainInput } from '../actions/fund-program-domain-input.interface';
import type { FundProjectDomainInput } from '../actions/fund-project-domain-input.interface';
import type { RefreshProgramDomainInput } from '../actions/refresh-program-domain-input.interface';

/**
 * Интерактор домена для распределения средств в CAPITAL контракте
 * Обрабатывает действия связанные с финансированием и обновлением CRPS
 */
@Injectable()
export class DistributionManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Финансирование программы в CAPITAL контракте
   */
  async fundProgram(data: FundProgramDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.FundProgram.IFundProgram = {
      coopname: data.coopname,
      amount: data.amount,
      memo: data.memo,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.fundProgram(blockchainData);
  }

  /**
   * Финансирование проекта в CAPITAL контракте
   */
  async fundProject(data: FundProjectDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.FundProject.IFundProject = {
      coopname: data.coopname,
      project_hash: data.project_hash,
      amount: data.amount,
      memo: data.memo,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.fundProject(blockchainData);
  }

  /**
   * Обновление CRPS пайщика в программе CAPITAL контракта
   */
  async refreshProgram(data: RefreshProgramDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.RefreshProgram.IRefreshProgram = {
      coopname: data.coopname,
      username: data.username,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.refreshProgram(blockchainData);
  }

  /**
   * Обновление CRPS пайщика в проекте CAPITAL контракта
   */
  async refreshProject(data: RefreshProjectDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.RefreshProject.IRefreshProject = {
      coopname: data.coopname,
      project_hash: data.project_hash,
      username: data.username,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.refreshProject(blockchainData);
  }
}
