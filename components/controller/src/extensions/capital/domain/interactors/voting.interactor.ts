import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { StartVotingDomainInput } from '../actions/start-voting-domain-input.interface';
import type { SubmitVoteDomainInput } from '../actions/submit-vote-domain-input.interface';
import type { CompleteVotingDomainInput } from '../actions/complete-voting-domain-input.interface';
import type { CalculateVotesDomainInput } from '../actions/calculate-votes-domain-input.interface';

/**
 * Интерактор домена для голосования в CAPITAL контракте
 * Обрабатывает действия связанные с процессом голосования
 */
@Injectable()
export class VotingInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Запуск голосования в CAPITAL контракте
   */
  async startVoting(data: StartVotingDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.StartVoting.IStartVoting = {
      coopname: data.coopname,
      project_hash: data.project_hash,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.startVoting(blockchainData);
  }

  /**
   * Голосование в CAPITAL контракте
   */
  async submitVote(data: SubmitVoteDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.SubmitVote.ISubmitVote = {
      coopname: data.coopname,
      voter: data.voter,
      project_hash: data.project_hash,
      votes: data.votes,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.submitVote(blockchainData);
  }

  /**
   * Завершение голосования в CAPITAL контракте
   */
  async completeVoting(data: CompleteVotingDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.CompleteVoting.ICompleteVoting = {
      coopname: data.coopname,
      project_hash: data.project_hash,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.completeVoting(blockchainData);
  }

  /**
   * Расчет голосов в CAPITAL контракте
   */
  async calculateVotes(data: CalculateVotesDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.CalculateVotes.IFinalVoting = {
      coopname: data.coopname,
      username: data.username,
      project_hash: data.project_hash,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.calculateVotes(blockchainData);
  }
}
