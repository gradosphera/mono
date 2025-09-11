import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { RefreshProjectDomainInput } from '../../domain/actions/refresh-project-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';
import type { FundProgramDomainInput } from '../../domain/actions/fund-program-domain-input.interface';
import type { FundProjectDomainInput } from '../../domain/actions/fund-project-domain-input.interface';
import type { RefreshProgramDomainInput } from '../../domain/actions/refresh-program-domain-input.interface';

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
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.fundProgram(data);
  }

  /**
   * Финансирование проекта в CAPITAL контракте
   */
  async fundProject(data: FundProjectDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.fundProject(data);
  }

  /**
   * Обновление CRPS пайщика в программе CAPITAL контракта
   */
  async refreshProgram(data: RefreshProgramDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.refreshProgram(data);
  }

  /**
   * Обновление CRPS пайщика в проекте CAPITAL контракта
   */
  async refreshProject(data: RefreshProjectDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.refreshProject(data);
  }
}
