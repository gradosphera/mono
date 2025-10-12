import { Injectable } from '@nestjs/common';
import { VotingInteractor } from '../use-cases/voting.interactor';
import type { StartVotingInputDTO } from '../dto/voting/start-voting-input.dto';
import type { SubmitVoteInputDTO } from '../dto/voting/submit-vote-input.dto';
import type { CompleteVotingInputDTO } from '../dto/voting/complete-voting-input.dto';
import type { CalculateVotesInputDTO } from '../dto/voting/calculate-votes-input.dto';
import type { TransactResult } from '@wharfkit/session';
import { VoteOutputDTO } from '../dto/voting/vote.dto';
import { VoteFilterInputDTO } from '../dto/voting/vote-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

/**
 * Сервис уровня приложения для голосования в CAPITAL
 * Обрабатывает запросы от VotingResolver
 */
@Injectable()
export class VotingService {
  constructor(private readonly votingInteractor: VotingInteractor) {}

  /**
   * Запуск голосования в CAPITAL контракте
   */
  async startVoting(data: StartVotingInputDTO): Promise<TransactResult> {
    return await this.votingInteractor.startVoting(data);
  }

  /**
   * Голосование в CAPITAL контракте
   */
  async submitVote(data: SubmitVoteInputDTO, username: string): Promise<TransactResult> {
    return await this.votingInteractor.submitVote({ ...data, voter: username });
  }

  /**
   * Завершение голосования в CAPITAL контракте
   */
  async completeVoting(data: CompleteVotingInputDTO): Promise<TransactResult> {
    return await this.votingInteractor.completeVoting(data);
  }

  /**
   * Расчет голосов в CAPITAL контракте
   */
  async calculateVotes(data: CalculateVotesInputDTO): Promise<TransactResult> {
    return await this.votingInteractor.calculateVotes(data);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех голосов
   */
  async getVotes(filter?: VoteFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<VoteOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.votingInteractor.getVotes(filter, domainOptions);

    // Конвертируем результат в DTO
    return {
      items: result.items as VoteOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение голоса по ID
   */
  async getVoteById(_id: string): Promise<VoteOutputDTO | null> {
    const vote = await this.votingInteractor.getVoteById(_id);
    return vote as VoteOutputDTO | null;
  }
}
