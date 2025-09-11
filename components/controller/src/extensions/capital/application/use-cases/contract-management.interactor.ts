import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { SetConfigDomainInput } from '../../domain/actions/set-config-domain-input.interface';

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
}
