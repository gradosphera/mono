import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { SetConfigDomainInput } from '../../domain/actions/set-config-domain-input.interface';
import type { GetCapitalConfigInputDTO } from '../dto/contract_management/get-config-input.dto';
import { ConfigOutputDTO } from '../dto/contract_management/config-output.dto';

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
    return await this.capitalBlockchainPort.setConfig(data);
  }

  /**
   * Получение конфигурации CAPITAL контракта
   */
  async getConfig(data: GetCapitalConfigInputDTO): Promise<ConfigOutputDTO | null> {
    // Получаем состояние из блокчейна (включая конфигурацию)
    const blockchainState = await this.capitalBlockchainPort.getConfig(data.coopname);

    // Извлекаем конфигурацию из состояния
    const config = blockchainState?.config;

    // Конвертируем в DTO
    return config
      ? {
          coopname: data.coopname,
          coordinator_bonus_percent: config.coordinator_bonus_percent,
          expense_pool_percent: config.expense_pool_percent,
          coordinator_invite_validity_days: config.coordinator_invite_validity_days,
          voting_period_in_days: config.voting_period_in_days,
          authors_voting_percent: config.authors_voting_percent,
          creators_voting_percent: config.creators_voting_percent,
        }
      : null;
  }
}
