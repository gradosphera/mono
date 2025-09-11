import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { CreateCommitDomainInput } from '../actions/create-commit-domain-input.interface';
import type { RefreshSegmentDomainInput } from '../actions/refresh-segment-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';

/**
 * Интерактор домена для генерации в CAPITAL контракте
 * Обрабатывает действия связанные с коммитами и обновлением сегментов
 */
@Injectable()
export class GenerationInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Создание коммита в CAPITAL контракте
   */
  async createCommit(data: CreateCommitDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createCommit(data);
  }

  /**
   * Обновление сегмента в CAPITAL контракте
   */
  async refreshSegment(data: RefreshSegmentDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.refreshSegment(data);
  }
}
