import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ResultSubmissionService } from '../services/result-submission.service';
import { PushResultInputDTO } from '../dto/result_submission/push-result-input.dto';
import { ConvertSegmentInputDTO } from '../dto/result_submission/convert-segment-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { ResultOutputDTO } from '../dto/result_submission/result.dto';
import { ResultFilterInputDTO } from '../dto/result_submission/result-filter.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';

// Пагинированные результаты
const paginatedResultsResult = createPaginationResult(ResultOutputDTO, 'PaginatedCapitalResults');

/**
 * GraphQL резолвер для действий подведения результатов CAPITAL контракта
 */
@Resolver()
export class ResultSubmissionResolver {
  constructor(private readonly resultSubmissionService: ResultSubmissionService) {}

  /**
   * Мутация для внесения результата в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalPushResult',
    description: 'Внесение результата в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async pushCapitalResult(@Args('data', { type: () => PushResultInputDTO }) data: PushResultInputDTO): Promise<string> {
    const result = await this.resultSubmissionService.pushResult(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для конвертации сегмента в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalConvertSegment',
    description: 'Конвертация сегмента в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async convertCapitalSegment(
    @Args('data', { type: () => ConvertSegmentInputDTO }) data: ConvertSegmentInputDTO
  ): Promise<string> {
    const result = await this.resultSubmissionService.convertSegment(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  // ============ ЗАПРОСЫ РЕЗУЛЬТАТОВ ============

  /**
   * Получение всех результатов с фильтрацией
   */
  @Query(() => paginatedResultsResult, {
    name: 'capitalResults',
    description: 'Получение списка результатов кооператива с фильтрацией',
  })
  async getResults(
    @Args('filter', { nullable: true }) filter?: ResultFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<ResultOutputDTO>> {
    return await this.resultSubmissionService.getResults(filter, options);
  }

  /**
   * Получение результата по ID
   */
  @Query(() => ResultOutputDTO, {
    name: 'capitalResult',
    description: 'Получение результата по внутреннему ID базы данных',
    nullable: true,
  })
  async getResult(@Args('_id') _id: string): Promise<ResultOutputDTO | null> {
    return await this.resultSubmissionService.getResultById(_id);
  }
}
