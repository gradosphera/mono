import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ResultSubmissionService } from '../services/result-submission.service';
import { PushResultInputDTO } from '../dto/result_submission/push-result-input.dto';
import { ConvertSegmentInputDTO } from '../dto/result_submission/convert-segment-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { ResultOutputDTO } from '../dto/result_submission/result.dto';
import { ResultFilterInputDTO } from '../dto/result_submission/result-filter.input';
import { GetResultInputDTO } from '../dto/result_submission/get-result-input.dto';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';

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
  @Mutation(() => TransactionDTO, {
    name: 'capitalPushResult',
    description: 'Внесение результата в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async pushCapitalResult(
    @Args('data', { type: () => PushResultInputDTO }) data: PushResultInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.resultSubmissionService.pushResult(data);
    return result;
  }

  /**
   * Мутация для конвертации сегмента в CAPITAL контракте
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalConvertSegment',
    description: 'Конвертация сегмента в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async convertCapitalSegment(
    @Args('data', { type: () => ConvertSegmentInputDTO }) data: ConvertSegmentInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.resultSubmissionService.convertSegment(data);
    return result;
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
  async getResult(@Args('data') data: GetResultInputDTO): Promise<ResultOutputDTO | null> {
    return await this.resultSubmissionService.getResultById(data._id);
  }

  // ============ ГЕНЕРАЦИЯ ДОКУМЕНТОВ ============

  /**
   * Мутация для генерации заявления о вкладе результатов
   */
  @Mutation(() => GeneratedDocumentDTO, {
    name: 'capitalGenerateResultContributionStatement',
    description: 'Сгенерировать заявление о вкладе результатов',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateResultContributionStatement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.resultSubmissionService.generateResultContributionStatement(data, options);
  }

  /**
   * Мутация для генерации решения о вкладе результатов
   */
  @Mutation(() => GeneratedDocumentDTO, {
    name: 'capitalGenerateResultContributionDecision',
    description: 'Сгенерировать решение о вкладе результатов',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateResultContributionDecision(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.resultSubmissionService.generateResultContributionDecision(data, options);
  }

  /**
   * Мутация для генерации акта о вкладе результатов
   */
  @Mutation(() => GeneratedDocumentDTO, {
    name: 'capitalGenerateResultContributionAct',
    description: 'Сгенерировать акт о вкладе результатов',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateResultContributionAct(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.resultSubmissionService.generateResultContributionAct(data, options);
  }
}
