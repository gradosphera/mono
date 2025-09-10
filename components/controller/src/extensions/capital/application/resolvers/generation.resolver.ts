import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import { CreateCommitInputDTO } from '../dto/generation/create-commit-input.dto';
import { RefreshSegmentInputDTO } from '../dto/generation/refresh-segment-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий генерации CAPITAL контракта
 */
@Resolver()
export class GenerationResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для создания коммита в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'createCapitalCommit',
    description: 'Создание коммита в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalCommit(
    @Args('data', { type: () => CreateCommitInputDTO }) data: CreateCommitInputDTO
  ): Promise<string> {
    const result = await this.capitalService.createCommit(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для обновления сегмента в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'refreshCapitalSegment',
    description: 'Обновление сегмента в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async refreshCapitalSegment(
    @Args('data', { type: () => RefreshSegmentInputDTO }) data: RefreshSegmentInputDTO
  ): Promise<string> {
    const result = await this.capitalService.refreshSegment(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
