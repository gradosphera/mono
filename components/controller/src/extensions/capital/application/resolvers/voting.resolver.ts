import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { VotingService } from '../services/voting.service';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { CalculateVotesInputDTO } from '../dto/voting/calculate-votes-input.dto';
import { CompleteVotingInputDTO } from '../dto/voting/complete-voting-input.dto';
import { StartVotingInputDTO } from '../dto/voting/start-voting-input.dto';
import { SubmitVoteInputDTO } from '../dto/voting/submit-vote-input.dto';
import { VoteOutputDTO } from '../dto/voting/vote.dto';
import { VoteFilterInputDTO } from '../dto/voting/vote-filter.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';

// Пагинированные результаты
const paginatedVotesResult = createPaginationResult(VoteOutputDTO, 'PaginatedCapitalVotes');

/**
 * GraphQL резолвер для действий голосования CAPITAL контракта
 */
@Resolver()
export class VotingResolver {
  constructor(private readonly votingService: VotingService) {}

  /**
   * Мутация для запуска голосования в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalStartVoting',
    description: 'Запуск голосования в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async StartVoting(@Args('data', { type: () => StartVotingInputDTO }) data: StartVotingInputDTO): Promise<string> {
    const result = await this.votingService.startVoting(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для голосования в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalSubmitVote',
    description: 'Голосование в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async submitCapitalVote(@Args('data', { type: () => SubmitVoteInputDTO }) data: SubmitVoteInputDTO): Promise<string> {
    const result = await this.votingService.submitVote(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для завершения голосования в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalCompleteVoting',
    description: 'Завершение голосования в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async completeCapitalVoting(
    @Args('data', { type: () => CompleteVotingInputDTO }) data: CompleteVotingInputDTO
  ): Promise<string> {
    const result = await this.votingService.completeVoting(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для расчета голосов в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalCalculateVotes',
    description: 'Расчет голосов в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async calculateCapitalVotes(
    @Args('data', { type: () => CalculateVotesInputDTO }) data: CalculateVotesInputDTO
  ): Promise<string> {
    const result = await this.votingService.calculateVotes(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  // ============ ЗАПРОСЫ ГОЛОСОВ ============

  /**
   * Получение всех голосов с фильтрацией
   */
  @Query(() => paginatedVotesResult, {
    name: 'capitalVotes',
    description: 'Получение списка голосов кооператива с фильтрацией',
  })
  async getVotes(
    @Args('filter', { nullable: true }) filter?: VoteFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<VoteOutputDTO>> {
    return await this.votingService.getVotes(filter, options);
  }

  /**
   * Получение голоса по ID
   */
  @Query(() => VoteOutputDTO, {
    name: 'capitalVote',
    description: 'Получение голоса по внутреннему ID базы данных',
    nullable: true,
  })
  async getVote(@Args('_id') _id: string): Promise<VoteOutputDTO | null> {
    return await this.votingService.getVoteById(_id);
  }
}
