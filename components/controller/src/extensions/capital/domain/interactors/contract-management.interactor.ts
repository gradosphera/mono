import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { SetConfigDomainInput } from '../actions/set-config-domain-input.interface';
import type { CreateProjectDomainInput } from '../actions/create-project-domain-input.interface';

/**
 * Интерактор домена для управления контрактом CAPITAL
 * Обрабатывает действия связанные с настройкой и созданием проектов
 */
@Injectable()
export class ContractManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Установка конфигурации CAPITAL контракта
   */
  async setConfig(data: SetConfigDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.SetConfig.ISetConfig = {
      coopname: data.coopname,
      config: {
        coordinator_bonus_percent: data.config.coordinator_bonus_percent,
        expense_pool_percent: data.config.expense_pool_percent,
        coordinator_invite_validity_days: data.config.coordinator_invite_validity_days,
        voting_period_in_days: data.config.voting_period_in_days,
        authors_voting_percent: data.config.authors_voting_percent,
        creators_voting_percent: data.config.creators_voting_percent,
      },
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.setConfig(blockchainData);
  }
}
