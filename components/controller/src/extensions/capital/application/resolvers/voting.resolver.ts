import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { CalculateVotesInputDTO } from '../dto/voting/calculate-votes-input.dto';
import { CompleteVotingInputDTO } from '../dto/voting/complete-voting-input.dto';
import { StartVotingInputDTO } from '../dto/voting/start-voting-input.dto';
import { SubmitVoteInputDTO } from '../dto/voting/submit-vote-input.dto';

/**
 * GraphQL резолвер для действий голосования CAPITAL контракта
 */
@Resolver()
export class VotingResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для запуска голосования в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'startCapitalVoting',
    description: 'Запуск голосования в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async startCapitalVoting(@Args('data', { type: () => StartVotingInputDTO }) data: StartVotingInputDTO): Promise<string> {
    const result = await this.capitalService.startVoting(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для голосования в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'submitCapitalVote',
    description: 'Голосование в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async submitCapitalVote(@Args('data', { type: () => SubmitVoteInputDTO }) data: SubmitVoteInputDTO): Promise<string> {
    const result = await this.capitalService.submitVote(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для завершения голосования в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'completeCapitalVoting',
    description: 'Завершение голосования в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async completeCapitalVoting(
    @Args('data', { type: () => CompleteVotingInputDTO }) data: CompleteVotingInputDTO
  ): Promise<string> {
    const result = await this.capitalService.completeVoting(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для расчета голосов в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'calculateCapitalVotes',
    description: 'Расчет голосов в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async calculateCapitalVotes(
    @Args('data', { type: () => CalculateVotesInputDTO }) data: CalculateVotesInputDTO
  ): Promise<string> {
    const result = await this.capitalService.calculateVotes(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
