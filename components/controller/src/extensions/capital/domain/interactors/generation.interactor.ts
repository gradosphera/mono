import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
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
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.CreateCommit.ICommit = {
      coopname: data.coopname,
      username: data.username,
      project_hash: data.project_hash,
      commit_hash: data.commit_hash,
      creator_hours: data.creator_hours,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createCommit(blockchainData);
  }

  /**
   * Обновление сегмента в CAPITAL контракте
   */
  async refreshSegment(data: RefreshSegmentDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.RefreshSegment.IRefreshSegment = {
      coopname: data.coopname,
      project_hash: data.project_hash,
      username: data.username,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.refreshSegment(blockchainData);
  }
}
