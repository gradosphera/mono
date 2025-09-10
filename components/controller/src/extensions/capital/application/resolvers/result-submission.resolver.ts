import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import { PushResultInputDTO } from '../dto/result_submission/push-result-input.dto';
import { ConvertSegmentInputDTO } from '../dto/result_submission/convert-segment-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий подведения результатов CAPITAL контракта
 */
@Resolver()
export class ResultSubmissionResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для внесения результата в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'pushCapitalResult',
    description: 'Внесение результата в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async pushCapitalResult(@Args('data', { type: () => PushResultInputDTO }) data: PushResultInputDTO): Promise<string> {
    const result = await this.capitalService.pushResult(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для конвертации сегмента в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'convertCapitalSegment',
    description: 'Конвертация сегмента в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async convertCapitalSegment(
    @Args('data', { type: () => ConvertSegmentInputDTO }) data: ConvertSegmentInputDTO
  ): Promise<string> {
    const result = await this.capitalService.convertSegment(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
