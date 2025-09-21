import { Resolver, Query, Args } from '@nestjs/graphql';
import { TimeTrackingService } from '../services/time-tracking.service';
import { TimeStatsInputDTO, FlexibleTimeStatsOutputDTO } from '../dto/time_tracker/flexible-time-stats.dto';
import { TimeEntryOutputDTO } from '../dto/time_tracker/time-entries.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import { TimeEntriesFilterInputDTO } from '../dto/time_tracker';

// Пагинированные результаты
const paginatedTimeEntriesResult = createPaginationResult(TimeEntryOutputDTO, 'PaginatedCapitalTimeEntries');

/**
 * GraphQL резолвер для действий учёта времени CAPITAL контракта
 */
@Resolver()
export class TimeTrackerResolver {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  /**
   * Гибкий запрос статистики времени с пагинацией
   */
  @Query(() => FlexibleTimeStatsOutputDTO, {
    name: 'capitalTimeStats',
    description: 'Гибкий запрос статистики времени вкладчиков по проектам с пагинацией',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async getCapitalTimeStats(
    @Args('data', { nullable: true }) data?: TimeStatsInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<FlexibleTimeStatsOutputDTO> {
    return await this.timeTrackingService.getFlexibleTimeStats(data || {}, options);
  }

  /**
   * Получение пагинированного списка записей времени по проекту
   */
  @Query(() => paginatedTimeEntriesResult, {
    name: 'capitalTimeEntries',
    description: 'Получение пагинированного списка записей времени',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async getCapitalTimeEntries(
    @Args('filter', { nullable: true }) filter?: TimeEntriesFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<TimeEntryOutputDTO>> {
    return await this.timeTrackingService.getTimeEntriesByProject(filter || {}, options);
  }
}
