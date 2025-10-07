import { Resolver, Query, Args } from '@nestjs/graphql';
import { SegmentsService } from '../services/segments.service';
import { SegmentOutputDTO } from '../dto/segments/segment.dto';
import { SegmentFilterInputDTO } from '../dto/segments/segment-filter.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

// Пагинированные результаты
const paginatedSegmentsResult = createPaginationResult(SegmentOutputDTO, 'PaginatedCapitalSegments');

/**
 * GraphQL резолвер для запросов сегментов CAPITAL контракта
 */
@Resolver()
export class SegmentsResolver {
  constructor(private readonly segmentsService: SegmentsService) {}

  /**
   * Получение всех сегментов с фильтрацией и пагинацией
   */
  @Query(() => paginatedSegmentsResult, {
    name: 'capitalSegments',
    description: 'Получение списка сегментов кооператива с фильтрацией и пагинацией',
  })
  @UseGuards(GqlJwtAuthGuard)
  async getSegments(
    @Args('filter', { nullable: true }) filter?: SegmentFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<SegmentOutputDTO>> {
    return await this.segmentsService.getSegments(filter, options);
  }
}
