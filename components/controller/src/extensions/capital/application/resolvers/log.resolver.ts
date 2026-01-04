import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { LogInteractor } from '../use-cases/log.interactor';
import { LogOutputDTO } from '../dto/logs/log.dto';
import { GetLogsInputDTO } from '../dto/logs/get-logs.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';

// Пагинированные результаты
const paginatedLogsResult = createPaginationResult(LogOutputDTO, 'PaginatedCapitalLogs');

/**
 * GraphQL резолвер для работы с логами событий
 */
@Resolver(() => LogOutputDTO)
@UseGuards(GqlJwtAuthGuard)
export class LogResolver {
  constructor(private readonly logInteractor: LogInteractor) {}

  /**
   * Получение логов с фильтрацией и пагинацией
   */
  @Query(() => paginatedLogsResult, {
    name: 'getCapitalLogs',
    description: 'Получить логи событий с фильтрацией и пагинацией',
  })
  async getLogs(@Args('data') data: GetLogsInputDTO): Promise<PaginationResult<LogOutputDTO>> {
    return await this.logInteractor.getLogs(data);
  }

  /**
   * Получение логов по хешу проекта
   */
  @Query(() => paginatedLogsResult, {
    name: 'getCapitalLogsByProjectHash',
    description: 'Получить логи событий по хешу проекта',
  })
  async getLogsByProjectHash(
    @Args('project_hash', { type: () => String }) project_hash: string,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<LogOutputDTO>> {
    return await this.logInteractor.getLogsByProjectHash(project_hash, options);
  }

  /**
   * Получение лога по ID
   */
  @Query(() => LogOutputDTO, {
    name: 'getCapitalLogById',
    description: 'Получить лог события по ID',
    nullable: true,
  })
  async getLogById(@Args('id', { type: () => String }) id: string): Promise<LogOutputDTO | null> {
    return await this.logInteractor.getLogById(id);
  }
}
